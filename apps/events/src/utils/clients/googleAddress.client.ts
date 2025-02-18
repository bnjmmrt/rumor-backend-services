// Move this to Utils

import axios from 'axios';
import config from '../../config'

class GoogleAddressClient {
  static GOOGLE_MAPS_API_KEY: string;

  constructor() {
    GoogleAddressClient.GOOGLE_MAPS_API_KEY = config.get('GOOGLE_MAPS_API_KEY');
  }

  static async findPlaceFromText(address: string) {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
        params: {
          input: encodeURIComponent(address),
          inputtype: 'textquery',
          fields: 'place_id',
          key: this.GOOGLE_MAPS_API_KEY,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async findPlaceFromPlaceId(placeId: string) {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
        params: {
          place_id: placeId,
          key: this.GOOGLE_MAPS_API_KEY,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async geodecodePlaceId(placeId: string) {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          place_id: placeId,
          key: this.GOOGLE_MAPS_API_KEY,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default GoogleAddressClient