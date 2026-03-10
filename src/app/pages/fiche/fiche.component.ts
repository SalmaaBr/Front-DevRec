import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fiche',
  standalone: true, // Ajouté pour le support standalone
  imports: [CommonModule], // Ajouté pour *ngIf et autres directives
  templateUrl: './fiche.component.html',
  styleUrls: ['./fiche.component.css'] // corrigé styleUrl -> styleUrls
})
export class FicheComponent {
  selectedFile: File | null = null;
  filePreview: string | null = null;
  fileType: string = '';
  fileSize: number = 0;
  uploadProgress: number = 0;
  isUploading: boolean = false;
  uploadSuccess: boolean = false;
  uploadError: string = '';
  
  // Ajout des propriétés manquantes
  isDragover: boolean = false;

  // Types de fichiers acceptés
  acceptedFileTypes: string[] = [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  // Taille maximale (5MB)
  maxFileSize: number = 5 * 1024 * 1024;

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    
    if (file) {
      // Validation du type de fichier
      if (!this.acceptedFileTypes.includes(file.type)) {
        this.uploadError = 'Type de fichier non supporté';
        this.selectedFile = null;
        return;
      }

      // Validation de la taille
      if (file.size > this.maxFileSize) {
        this.uploadError = 'Le fichier est trop volumineux (max 5MB)';
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
      this.fileSize = file.size;
      this.fileType = file.type;
      this.uploadError = '';

      // Créer un aperçu pour les images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.filePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.filePreview = null;
      }
    }
  }

  // Ajout des méthodes manquantes pour le drag & drop
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragover = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Réutiliser la même logique que onFileSelected
      if (!this.acceptedFileTypes.includes(file.type)) {
        this.uploadError = 'Type de fichier non supporté';
        this.selectedFile = null;
        return;
      }

      if (file.size > this.maxFileSize) {
        this.uploadError = 'Le fichier est trop volumineux (max 5MB)';
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
      this.fileSize = file.size;
      this.fileType = file.type;
      this.uploadError = '';

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.filePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.filePreview = null;
      }
    }
  }

  uploadFile() {
    if (!this.selectedFile) {
      this.uploadError = 'Veuillez sélectionner un fichier';
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadSuccess = false;
    this.uploadError = '';

    // Simulation de l'upload avec progression
    const interval = setInterval(() => {
      if (this.uploadProgress < 100) {
        this.uploadProgress += 10;
      } else {
        clearInterval(interval);
        this.isUploading = false;
        this.uploadSuccess = true;
        
        // Ici vous pouvez ajouter votre logique d'upload réel
        // this.uploadToServer(this.selectedFile);
      }
    }, 500);
  }

  removeFile() {
    this.selectedFile = null;
    this.filePreview = null;
    this.fileSize = 0;
    this.fileType = '';
    this.uploadProgress = 0;
    this.uploadSuccess = false;
    this.uploadError = '';
    
    // Réinitialiser l'input file
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(): string {
    if (this.fileType.startsWith('image/')) return '🖼️';
    if (this.fileType === 'application/pdf') return '📄';
    if (this.fileType.includes('word')) return '📝';
    if (this.fileType === 'text/plain') return '📃';
    return '📁';
  }
}