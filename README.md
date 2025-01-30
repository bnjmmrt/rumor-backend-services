Mirco Services
- Users
- Events
- Notifications



Routes - Routing - Responsible for getting request and sending response to requesting client
Controller - Buisness Logic - Responsible for writting buisness Logic 
Services - Holds querying to database



Wrong APIs

- users service -> getHosts function is directly accessing events table for getting the count, instead it should be a micro service call.

Wrong DB Import -> Search for above to check the wrong db entity imports