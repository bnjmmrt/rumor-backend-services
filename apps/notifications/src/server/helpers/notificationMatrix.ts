let notificationMatrix = {
  applicationAppoved: {
    pushMessage: "Welcome to Rumor. Your application has been approved!",
    PushNotification: true,
    appNotification: false,
  },
  profileReferrals: {
    pushMessage:
      "[User Full Name] has requested your referral to Rumor. Tap to refer them now! ",
    appMessage:
      "[Requested Name] has requested your referral to become a Rumor member. ",
    appNotification: true,
    pushNotification: true,
    body: { userId: "" },
    linkedUser: "",
  },
  eventReminder: {
    pushMessage:
      "Just a reminder, you are scheduled to attend [event] tomorrow at [start time].",
    appNotification: false,
    pushNotification: true,
    body: { eventId: "" },
    linkedEvent: "",
  },
  eventCancelled: {
    pushMessage: "Hi [name], [event name] has been canceled.",
    appMessage: "[Host Name] canceled [Event Name] ",
    pushNotification: true,
    appNotification: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  eventInvitation: {
    pushMessage: "You've received an invite to attend [event]! Tap to RSVP.",
    appMessage: "[Host Name] invited you to attend [Event Name] ",
    appNotification: true,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  eventPosted: {
    pushMessage: "[Host Name] just posted a new event. Check it out now. ",
    appMessage: "[Host Name] just published a new event [Event Name]",
    appNotification: true,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  eventPostedCity: {
    pushMessage:
      "[Host name] just posted a new event in [Base City]. Check it out now. ",
    appMessage:
      "A new event [Event Name] was just published in [User's Base City]",
    appNotification: true,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
    linkedCity: "",
  },
  eventRequestDenied: {
    pushMessage:
      "Your request for [event name] was declined. Check out other events on Rumor.",
    appMessage: "Your request to attend [Event Name] has been declined.",
    appNotification: true,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  eventVouch: {
    pushMessage:
      "[User Full Name] has requested your vouch to attend [Event Name]. Tap to refer them now!",
    appMessage: "[Requested Name] has requested for you to vouch for them.",
    appNotification: true,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  eventAnnouncement: {
    pushMessage:
      "[Host] just posted a new event announcement for [Event]. Tap to view.",
    appMessage: "[Host Name] posted a new announcement for [Event Name]",
    appNotification: true,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  signUpFormApproved: {
    pushMessage: "",
    appMessage: "[Host Name] approved your request to attend [Event Name]",
    appNotification: true,
    pushNotificaton: false,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  signUpFormRejected: {
    pushMessage: "",
    appMessage: "[Host Name] declined your request to attend [Event Name]",
    appNotification: true,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  eventSubmissionApproved: {
    pushMessage:
      "Event Name] is live on Rumor! Tap to send invites and manage your guest list. (Links to Event details page in host app)",
    appMessage: "Rumor has approved your event [Event Name]",
    appNotification: true,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  userApplication: {
    pushMessage: "",
    appMessage: "[User Name] submitted a New User Application",
    appNotification: true,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  hostApplication: {
    pushMessage: "",
    appMessage: "[Host Company Name] submitted a New Host Application",
    appNotification: true,
    pushNotificaton: false,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  eventSubmitted: {
    pushMessage: "",
    appMessage: "[Host Company Name] submitted a new event [New Event Name]",
    appNotification: false,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  eventEdited: {
    pushMessage: "",
    appMessage: "[Host Company name] made edits to [Event Name]",
    appNotification: true,
    pushNotificaton: false,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  hostReport: {
    pushMessage: "",
    appMessage: "[Host Company Name] submitted a report against [Member Name]",
    appNotification: true,
    pushNotificaton: false,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  hostFeedback: {
    pushMessage: "",
    appMessage: "[Host Company Name] submitted feedback",
    appNotification: true,
    pushNotificaton: false,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  userReport: {
    pushMessage: "",
    appMessage: "[Member Name] submitted a report against [Host Company Name]",
    appNotification: true,
    pushNotificaton: false,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  userFeedback: {
    pushMessage: "",
    appMessage: "[User Name] submitted feedback",
    appNotification: true,
    pushNotificaton: false,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  }
};


function getNotificationDetails(notificationType: string) {
    const notification = notificationMatrix[notificationType as keyof typeof notificationMatrix];
  
    if (!notification) {
      throw new Error(`Invalid notification type: ${notificationType}`);
    }
  
    return { notificationType, ...notification };
}


