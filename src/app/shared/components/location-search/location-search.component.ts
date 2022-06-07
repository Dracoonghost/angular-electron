/* eslint-disable @typescript-eslint/prefer-for-of */
import { CommonService } from '../../../services/common/common.service';
import { Component, OnInit, ChangeDetectionStrategy, Output, Input, ChangeDetectorRef } from '@angular/core';
import { MapPropertiesService } from '../../../services/map-properties/map-properties.service';
import { EventEmitter } from '@angular/core';

declare let $: any;
declare let google: any;

@Component({
  selector: 'app-location-search',
  templateUrl: './location-search.component.html',
  styleUrls: ['./location-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationSearchComponent implements OnInit {

  @Output() listenLocation: EventEmitter<any> = new EventEmitter();
  @Input() type: string;
  mapShow = false;
  locationget: '';
  value: any;
  data = {
    city: 'London',
    country: 'United Kingdon',
    latitude: 51.51651555246089,
    longitude: -0.12572457964518335,
    state: 'England'
  };
  location: any = {};
  map;
  constructor(private commonService: CommonService, private MapProperties: MapPropertiesService, private cdr: ChangeDetectorRef) { }


  ngOnInit() {
    this.initializeMap();
  }
  initializeMap() {
    try {
      if (this.commonService.NFT) {
        const data = {
          city: this.commonService.NFT.city || 'London',
          country: this.commonService.NFT.country || 'United Kingdon',
          latitude: this.commonService.NFT.latitude || 51.51651555246089,
          longitude: this.commonService.NFT.longitude || -0.12572457964518335,
          state: this.commonService.NFT.state || 'England'
        };
        this.showMap(data);
        this.openMap(data);
        const options = {
          types: ['(cities)'],
        };
        this.searchLocation(options);
      } else {
        this.showMap(this.data);
        this.openMap(this.data);
        const options = {
          types: ['(cities)'],
        };
        this.searchLocation(options);
      }
    } catch (error) {
      console.log({ error });
    }
  }

  searchLocation(options) {

    const inputs = document.getElementsByClassName('locationSerchac');
    const _this = this;
    for (let i = 0; i < inputs.length; i++) {
      const autocomplete = new google.maps.places.Autocomplete(inputs[i], { options });
      autocomplete.addListener('place_changed', function() {
        const place = this.getPlace();
        const location: any = {};
        place.address_components.forEach((element) => {
          if (element.types.includes('locality')) {
            location.city = element.long_name;
          }
          if (element.types.includes('administrative_area_level_1')) {
            location.state = element.long_name;
          }
          if (element.types.includes('country')) {
            location.country = element.long_name;
          }
        });
        location.latitude = place.geometry.location.lat();
        location.longitude = place.geometry.location.lng();
        console.log(location);
        _this.listenLocation.emit(location);
        this.location = location;
        _this.showMap(location);

      });
    }
  }


  openMap(data) {
    if (data) {
      if (data[0]) {
        this.locationget = data[0].locationTypeCode;
        console.log(data, 'datafor location', this.locationget);
        this.value = data[0].city + ', ' + data[0].country;
      } else {
        const location = data;
        console.log(data, 'datafor location1', this.location);
        this.showMap(location);
      }
    }

    const latlng = new google.maps.LatLng(51.51574107919467, -0.12907197649577887);
    const mapProp = {
      gestureHandling: 'greedy', disableDefaultUI: true, zoom: 15, streetViewControl: false, center: latlng, mapTypeControl: false,
      fullscreenControl: false, maxZoom: 18, minZoom: 13, clickableIcons: false,
    };
    const map = new google.maps.Map(document.getElementById('map'), mapProp);
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(51.51574107919467, -0.12907197649577887),
      map,
      title: 'testing', //The title on hover to display
      draggable: true, //this makes it drag and drop
      icon: 'assets/images/map-marker.png'
    });

    google.maps.event.addListener(marker, 'dragend', (a) => {
      console.log(a);
      console.log(a.latLng.lat(), a.latLng.lng());
      this.location.city = 'London';
      this.location.state = 'England';
      this.location.country = 'United Kingdom';
      this.location.latitude = a.latLng.lat();
      this.location.longitude = a.latLng.lng();
      console.log(this.location);

      this.listenLocation.emit(this.location);
    });


  }


  showMap(location) {
    try {
      this.value = location.city + ', ' + location.state + ', ' + location.country;
      this.location = location;
      $('#map').removeClass('hide');
      const latlng = new google.maps.LatLng(location.latitude, location.longitude);
      const mapProp = {
        gestureHandling: 'greedy', disableDefaultUI: true, zoom: 15, streetViewControl: false, center: latlng, mapTypeControl: false,
        fullscreenControl: false, maxZoom: 18, minZoom: 13, clickableIcons: false,
      };
      const styledMapType = new google.maps.StyledMapType(this.MapProperties.mapPropertiesDark);
      if (this.commonService.night) {
        var map = new google.maps.Map(document.getElementById('map'), mapProp);
      } else {
        var map = new google.maps.Map(document.getElementById('map'), mapProp);
      } //same map on both conditions'


      const marker = new google.maps.Marker({
        position: latlng,
        map,
        title: 'Place the marker for your location!',
        draggable: true
      });
      google.maps.event.addListener(marker, 'dragend', (a) => {
        console.log(a.latLng.lat(), a.latLng.lng());
        console.log(this.location);
        if (a.latlng) {
          this.location.latitude = a.latlng.lat();
          this.location.longitude = a.latlng.lng();
          this.listenLocation.emit(this.location);
        }

      });

    } catch (error) {

    }
  }
}
