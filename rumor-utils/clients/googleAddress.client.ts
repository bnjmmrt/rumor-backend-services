// import axios from 'axios';

// class GoogleAddressClient {
//   private readonly GOOGLE_MAPS_API_KEY: string;

//   constructor(private readonly configService: ConfigService) {
//     this.GOOGLE_MAPS_API_KEY = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
//   }

//   async static findPlaceFromText(address: string) {
//     try {
//       const response = await axios.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', {
//         params: {
//           input: encodeURIComponent(address),
//           inputtype: 'textquery',
//           fields: 'place_id',
//           key: this.GOOGLE_MAPS_API_KEY,
//         },
//       });
//       return response.data;
//     } catch (error) {
//       Logger.error('Error fetching place from text', error);
//       throw error;
//     }
//   }

//   async findPlaceFromPlaceId(placeId: string) {
//     try {
//       const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
//         params: {
//           place_id: placeId,
//           key: this.GOOGLE_MAPS_API_KEY,
//         },
//       });
//       return response.data;
//     } catch (error) {
//       Logger.error('Error fetching place details', error);
//       throw error;
//     }
//   }

//   async geodecodePlaceId(placeId: string) {
//     try {
//       const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
//         params: {
//           place_id: placeId,
//           key: this.GOOGLE_MAPS_API_KEY,
//         },
//       });
//       return response.data;
//     } catch (error) {
//       Logger.error('Error geodecoding place details', error);
//       throw error;
//     }
//   }
// }

// let GoogleAddressClient = new GoogleAddressClient()

// export default 