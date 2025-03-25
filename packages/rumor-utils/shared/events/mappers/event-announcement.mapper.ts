interface EventAnnouncementGuest {
    id: string;
    firstName: string;
    lastName: string;
    userName?: string | null;
    profileImage?: string | null;
    addedBy?:any;
    ticketType?:any;
  }
  
export const toEventAnnouncementGuests = (guestsData: any[]): EventAnnouncementGuest[] => {
    if (!Array.isArray(guestsData)) {
      throw new Error("Invalid input: Expected an array of guests.");
    }
  
    return guestsData
      .filter(guest => guest?.user)
      .map(guest => ({
        id: guest.user.id,
        firstName: guest.user.firstName,
        lastName: guest.user.lastName,
        userName: guest.user.username || null,
        profileImage: guest.user.profilePicture || null,
        addedBy: guest.addedBy,
        ticketType: guest.ticketType
      }));
  }; 

export const toEventAnnouncementRecipients = (recipientData: any[]): EventAnnouncementGuest[] => {
    if (!Array.isArray(recipientData)) {
      throw new Error("Invalid input: Expected an array of guests.");
    }
  
    return recipientData
      .filter(guest => guest?.user)
      .map(guest => ({
        id: guest.id,
        firstName: guest.user.firstName,
        lastName: guest.user.lastName,
        userName: guest.user.username || null,
        profileImage: guest.user.profilePicture || null
      }));
  }; 
  