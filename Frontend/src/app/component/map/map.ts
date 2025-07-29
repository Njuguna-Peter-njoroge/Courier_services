import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import { Order, OrderService } from '../../services/order.service';
import { NgIf, NgFor } from '@angular/common';
import { Navbar } from '../Shared/navbar/navbar';
import { Footer } from '../Shared/footer/footer';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subscription } from 'rxjs';

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
export class CourierMapComponent implements OnInit, OnDestroy {
  @ViewChild(GoogleMap) map!: GoogleMap;

  orders: Order[] = [];
  selectedOrder: Order | null = null;
  isTracking = false;

  zoom = 12;
  center: google.maps.LatLngLiteral = { lat: -1.286389, lng: 36.817223 }; // Default to Nairobi
  pickupMarker: google.maps.LatLngLiteral | null = null;
  deliveryMarker: google.maps.LatLngLiteral | null = null;
  courierMarker: google.maps.LatLngLiteral | null = null;

  private socket$: WebSocketSubject<any>;
  private socketSubscription: Subscription | null = null;

  constructor(private orderService: OrderService) {
    const wsUrl = 'ws://localhost:3000'; // Adjust to your backend websocket URL
    this.socket$ = webSocket(wsUrl);
  }

  ngOnInit(): void {
    this.orderService.getOrders().subscribe((orders: Order[]) => {
      this.orders = orders;
    });

    this.socketSubscription = this.socket$.subscribe({
      next: (msg) => this.handleSocketMessage(msg),
      error: (err) => console.error('WebSocket error:', err),
      complete: () => console.warn('WebSocket connection closed')
    });
  }

  ngOnDestroy(): void {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
    this.socket$.complete();
  }

  private handleSocketMessage(msg: any): void {
    if (msg.type === 'orderUpdate' && msg.data) {
      const updatedOrder: Order = msg.data;
      const index = this.orders.findIndex(o => o.id === updatedOrder.id);
      if (index !== -1) {
        this.orders[index] = updatedOrder;
      } else {
        this.orders.push(updatedOrder);
      }
      if (this.isTracking && this.selectedOrder && this.selectedOrder.id === updatedOrder.id) {
        this.centerOnOrder(updatedOrder);
      }
    }
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
        this.drawRoute(pickupLocation, deliveryLocation);
      });

      // Courier marker could be updated from order data if available
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
    this.orderService.getOrders().subscribe((orders: Order[]) => {
      this.orders = orders;
    });
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

  private directionsService = new google.maps.DirectionsService();
  private directionsRenderer = new google.maps.DirectionsRenderer();

  ngAfterViewInit(): void {
    if (this.map && this.map.googleMap) {
      this.directionsRenderer.setMap(this.map.googleMap);
    } else {
      console.error('Map or googleMap is undefined');
    }
  }

  private drawRoute(start: google.maps.LatLngLiteral, end: google.maps.LatLngLiteral): void {
    if (!this.map || !this.map.googleMap) {
      console.error('Map not initialized');
      return;
    }

    this.directionsService.route(
      {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          this.directionsRenderer.setDirections(result);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      }
    );
  }

  private clusterMarkers(): void {
    if (!this.map || !this.map.googleMap) {
      console.error('Map not initialized');
      return;
    }
    // Implement marker clustering or offsetting logic here
    // For example, use MarkerClusterer library if available
    // This is a placeholder for clustering logic
    console.log('Clustering markers');
  }
}
