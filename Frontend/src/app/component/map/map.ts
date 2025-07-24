import { Component, OnInit, ViewChild } from '@angular/core';
import {GoogleMap, MapMarker} from '@angular/google-maps';
import { Order, OrderService } from '../../services/order.service';
import { NgIf, NgFor } from '@angular/common';
import {Navbar} from '../Shared/navbar/navbar';
import {Footer} from '../Shared/footer/footer';

@Component({
  selector: 'app-map',
  templateUrl: './map.html',
  imports: [
    NgIf,
    NgFor,
    MapMarker,
    GoogleMap,
    Navbar,
    Footer
  ],
  styleUrls: ['./map.css']
})
export class CourierMapComponent implements OnInit {
  @ViewChild(GoogleMap) map!: GoogleMap;

  orders: Order[] = [];
  selectedOrder: Order | null = null;
  isTracking = false;

  zoom = 12;
  center: google.maps.LatLngLiteral = { lat: -1.286389, lng: 36.817223 }; // Default to Nairobi
  pickupMarker: google.maps.LatLngLiteral | null = null;
  deliveryMarker: google.maps.LatLngLiteral | null = null;
  courierMarker: google.maps.LatLngLiteral | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orders = this.orderService.getOrders();
  }

  selectOrder(order: Order): void {
    this.selectedOrder = order;
    this.centerOnOrder(order);
  }

  centerOnOrder(order: Order): void {
    this.geocodeAddress(order.pickupAddress, (pickupLocation) => {
      this.pickupMarker = pickupLocation;
      this.center = pickupLocation;

      this.geocodeAddress(order.deliveryAddress, (deliveryLocation) => {
        this.deliveryMarker = deliveryLocation;
      });

      // Fake courier marker for demo
      this.courierMarker = {
        lat: pickupLocation.lat + 0.01,
        lng: pickupLocation.lng + 0.01,
      };
    });
  }

  startTracking(order: Order): void {
    this.isTracking = true;
    this.selectOrder(order);
  }

  stopTracking(): void {
    this.isTracking = false;
    this.courierMarker = null;
  }

  refreshMap(): void {
    this.orders = this.orderService.getOrders();
  }

  toggleRoutes(): void {
    alert('Toggle routes is not implemented yet');
  }

  private geocodeAddress(address: string, callback: (location: google.maps.LatLngLiteral) => void): void {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        callback({ lat: location.lat(), lng: location.lng() });
      } else {
        console.error('Geocode failed:', status);
      }
    });
  }
}
