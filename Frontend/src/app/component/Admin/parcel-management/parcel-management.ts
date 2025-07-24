import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ParcelService } from '../../../services/parcel.service';
import { Parcel, ParcelStatus, Priority, ParcelFilter } from '../../../models/parcel.model';

// Add GoodType enum for dropdown
export enum GoodType {
  FOOD = 'FOOD',
  ELECTRONICS = 'ELECTRONICS',
  DOCUMENTS = 'DOCUMENTS',
  CLOTHING = 'CLOTHING',
  OTHER = 'OTHER'
}
import {Navbar} from '../../Shared/navbar/navbar';
import {Footer} from '../../Shared/footer/footer';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-parcel-management',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Footer],
  templateUrl: './parcel-management.html',
  styleUrl: './parcel-management.css'
})
export class ParcelManagementComponent implements OnInit, OnDestroy {
  parcels: Parcel[] = [];
  filteredParcels: Parcel[] = [];
  selectedParcel: Parcel | null = null;
  showStatusModal = false;
  showDeleteModal = false;
  showCreateModal = false;
  showDetailsModal = false;
  loading = false;

  // Filter properties
  filter: ParcelFilter = {};
  searchTerm = '';
  selectedStatus = '';
  selectedPriority = '';

  // Status update properties
  newStatus: ParcelStatus = ParcelStatus.PENDING;
  statusReason = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Enums for template
  ParcelStatus = ParcelStatus;
  Priority = Priority;

  GoodType = GoodType;

  // Math object for template
  Math = Math;

  private subscription = new Subscription();

  // For create parcel modal
  newParcel: any = {
    description: '',
    weight: null,
    dimensions: '',
    goodType: '',
    priority: 'NORMAL'
  };

  constructor(private parcelService: ParcelService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.loadParcels();
    // Set up periodic refresh to catch new orders
    this.setupPeriodicRefresh();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadParcels(): void {
    this.loading = true;
    // First refresh the data to include any new orders
    this.parcelService.refreshData();
    
    this.subscription.add(
      this.parcelService.getAllParcels().subscribe({
        next: (parcels) => {
          this.parcels = parcels;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading parcels:', error);
          this.loading = false;
        }
      })
    );
  }

  setupPeriodicRefresh(): void {
    // Refresh data every 5 seconds to catch new orders
    setInterval(() => {
      if (!this.loading) {
        this.parcelService.refreshData();
      }
    }, 5000);
  }

  applyFilters(): void {
    this.filter = {
      searchTerm: this.searchTerm || undefined,
      status: this.selectedStatus as ParcelStatus || undefined,
      priority: this.selectedPriority as Priority || undefined
    };

    this.subscription.add(
      this.parcelService.filterParcels(this.filter).subscribe({
        next: (filtered) => {
          this.filteredParcels = filtered;
          this.updatePagination();
        }
      })
    );
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredParcels.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  get paginatedParcels(): Parcel[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredParcels.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Modal methods
  openStatusModal(parcel: Parcel): void {
    this.selectedParcel = parcel;
    this.newStatus = parcel.status;
    this.statusReason = '';
    this.showStatusModal = true;
  }

  openDeleteModal(parcel: Parcel): void {
    this.selectedParcel = parcel;
    this.showDeleteModal = true;
  }

  openDetailsModal(parcel: Parcel): void {
    this.selectedParcel = parcel;
    this.showDetailsModal = true;
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.newParcel = {
      description: '',
      weight: null,
      dimensions: '',
      goodType: '',
      priority: 'NORMAL'
    };
  }
  submitCreateParcel(): void {
    if (!this.newParcel.description || !this.newParcel.weight || !this.newParcel.dimensions || !this.newParcel.goodType || !this.newParcel.priority) {
      this.showErrorMessage('Please fill all required fields.');
      return;
    }
    this.loading = true;
    // Here you would call your parcelService to create the parcel, e.g.:
    // this.parcelService.createParcel(this.newParcel).subscribe(...)
    // For now, just simulate and close modal
    setTimeout(() => {
      this.showCreateModal = false;
      this.loading = false;
      this.showSuccessMessage('Parcel created successfully');
      this.loadParcels();
    }, 1000);
  }

  closeModals(): void {
    this.showStatusModal = false;
    this.showDeleteModal = false;
    this.showCreateModal = false;
    this.showDetailsModal = false;
    this.selectedParcel = null;
    this.statusReason = '';
  }

  // CRUD Operations
  updateStatus(): void {
    if (!this.selectedParcel) return;

    this.loading = true;
    this.subscription.add(
      this.parcelService.updateParcelStatus(
        this.selectedParcel.id,
        this.newStatus,
        this.statusReason
      ).subscribe({
        next: (success) => {
          if (success) {
            this.loadParcels();
            this.closeModals();
            this.showSuccessMessage('Status updated successfully');
          } else {
            this.showErrorMessage('Failed to update status');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating status:', error);
          this.showErrorMessage('Error updating status');
          this.loading = false;
        }
      })
    );
  }

  deleteParcel(): void {
    if (!this.selectedParcel) return;

    this.loading = true;
    this.subscription.add(
      this.parcelService.deleteParcel(this.selectedParcel.id).subscribe({
        next: (success) => {
          if (success) {
            this.loadParcels();
            this.closeModals();
            this.showSuccessMessage('Parcel deleted successfully');
          } else {
            this.showErrorMessage('Failed to delete parcel');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting parcel:', error);
          this.showErrorMessage('Error deleting parcel');
          this.loading = false;
        }
      })
    );
  }

  // Utility methods
  getStatusClass(status: ParcelStatus): string {
    const statusClasses = {
      [ParcelStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [ParcelStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
      [ParcelStatus.PICKED_UP]: 'bg-purple-100 text-purple-800',
      [ParcelStatus.IN_TRANSIT]: 'bg-orange-100 text-orange-800',
      [ParcelStatus.OUT_FOR_DELIVERY]: 'bg-indigo-100 text-indigo-800',
      [ParcelStatus.DELIVERED]: 'bg-green-100 text-green-800',
      [ParcelStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [ParcelStatus.RETURNED]: 'bg-gray-100 text-gray-800',
      [ParcelStatus.FAILED_DELIVERY]: 'bg-red-100 text-red-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  getPriorityClass(priority: Priority): string {
    const priorityClasses = {
      [Priority.LOW]: 'bg-gray-100 text-gray-600',
      [Priority.NORMAL]: 'bg-blue-100 text-blue-600',
      [Priority.HIGH]: 'bg-orange-100 text-orange-600',
      [Priority.URGENT]: 'bg-red-100 text-red-600'
    };
    return priorityClasses[priority] || 'bg-gray-100 text-gray-600';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get pageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Notification methods
  private showSuccessMessage(message: string): void {
    this.toastService.success(message);
  }

  private showErrorMessage(message: string): void {
    this.toastService.error(message);
  }

  // Bulk operations
  bulkUpdateStatus(status: ParcelStatus): void {
    // Implementation for bulk status updates
    console.log('Bulk update to status:', status);
  }

  exportParcels(): void {
    // Implementation for exporting parcel data
    console.log('Exporting parcels...');
  }

  // Search and filter methods
  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onPriorityFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.applyFilters();
  }
}
