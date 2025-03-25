import axios from 'axios';
import config from '../../config'

class GoogleAddressClientHandler {

   async findPlaceFromText(address: string) {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
        params: {
          input: encodeURIComponent(address),
          inputtype: 'textquery',
          fields: 'place_id',
          key: config.get('GOOGLE_MAPS_API_KEY'),
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

   async findPlaceFromPlaceId(placeId: string) {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
        params: {
          place_id: placeId,
          key: config.get('GOOGLE_MAPS_API_KEY'),
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

   async geodecodePlaceId(placeId: string) {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          place_id: placeId,
          key: config.get('GOOGLE_MAPS_API_KEY'),
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
const GoogleAddressClient = new GoogleAddressClientHandler();
export default GoogleAddressClient