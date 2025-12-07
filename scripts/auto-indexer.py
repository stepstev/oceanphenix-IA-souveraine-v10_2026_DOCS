#!/usr/bin/env python3
"""
Auto-indexer pour Open WebUI
Surveille MinIO et indexe automatiquement les nouveaux documents
"""

import os
import time
import hashlib
import requests
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

OPENWEBUI_URL = os.getenv("OPENWEBUI_URL", "http://openwebui:8080")
OPENWEBUI_API_KEY = os.getenv("OPENWEBUI_API_KEY", "")
DOCS_DIR = os.getenv("DOCS_DIR", "/docs")
CHECK_INTERVAL = int(os.getenv("CHECK_INTERVAL", "10"))

SUPPORTED_EXTENSIONS = {'.pdf', '.txt', '.md', '.docx', '.doc', '.csv', '.json'}

class DocumentIndexer(FileSystemEventHandler):
    def __init__(self):
        self.indexed_files = set()
        self.session = requests.Session()
        if OPENWEBUI_API_KEY:
            self.session.headers.update({"Authorization": f"Bearer {OPENWEBUI_API_KEY}"})
    
    def get_file_hash(self, filepath):
        """Calcule le hash MD5 d'un fichier"""
        hash_md5 = hashlib.md5()
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()
    
    def should_index(self, filepath):
        """Vérifie si le fichier doit être indexé"""
        path = Path(filepath)
        if not path.is_file():
            return False
        if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            return False
        file_hash = self.get_file_hash(filepath)
        if file_hash in self.indexed_files:
            return False
        return True
    
    def index_document(self, filepath):
        """Indexe un document dans Open WebUI"""
        try:
            path = Path(filepath)
            print(f"📄 Indexation de {path.name}...")
            
            with open(filepath, 'rb') as f:
                files = {'file': (path.name, f, 'application/octet-stream')}
                response = self.session.post(
                    f"{OPENWEBUI_URL}/api/v1/documents",
                    files=files,
                    timeout=300
                )
            
            if response.status_code == 200:
                file_hash = self.get_file_hash(filepath)
                self.indexed_files.add(file_hash)
                print(f"✅ {path.name} indexé avec succès")
                return True
            else:
                print(f"❌ Erreur {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Erreur lors de l'indexation de {filepath}: {e}")
            return False
    
    def scan_directory(self):
        """Scanne le répertoire pour indexer les fichiers existants"""
        print(f"🔍 Scan du répertoire {DOCS_DIR}...")
        indexed_count = 0
        
        for root, dirs, files in os.walk(DOCS_DIR):
            for filename in files:
                filepath = os.path.join(root, filename)
                if self.should_index(filepath):
                    if self.index_document(filepath):
                        indexed_count += 1
        
        print(f"✅ Scan terminé: {indexed_count} fichiers indexés")
    
    def on_created(self, event):
        """Appelé quand un nouveau fichier est créé"""
        if not event.is_directory and self.should_index(event.src_path):
            time.sleep(1)  # Attendre que le fichier soit complètement écrit
            self.index_document(event.src_path)
    
    def on_modified(self, event):
        """Appelé quand un fichier est modifié"""
        if not event.is_directory:
            path = Path(event.src_path)
            if path.suffix.lower() in SUPPORTED_EXTENSIONS:
                # Réindexer le fichier modifié
                file_hash = self.get_file_hash(event.src_path)
                if file_hash not in self.indexed_files:
                    self.index_document(event.src_path)

def main():
    print("🚀 Démarrage de l'auto-indexer Open WebUI")
    print(f"📂 Surveillance du répertoire: {DOCS_DIR}")
    print(f"🔗 Open WebUI: {OPENWEBUI_URL}")
    
    indexer = DocumentIndexer()
    
    # Scan initial
    indexer.scan_directory()
    
    # Surveillance en temps réel
    observer = Observer()
    observer.schedule(indexer, DOCS_DIR, recursive=True)
    observer.start()
    
    print("👀 Surveillance active des nouveaux fichiers...")
    
    try:
        while True:
            time.sleep(CHECK_INTERVAL)
    except KeyboardInterrupt:
        observer.stop()
        print("\n⏹️  Arrêt de l'auto-indexer")
    
    observer.join()

if __name__ == "__main__":
    main()
