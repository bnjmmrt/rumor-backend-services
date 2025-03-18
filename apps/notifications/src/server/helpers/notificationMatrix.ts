let notificationMatrix = {
  applicationAppoved: {
    pushMessage: "Welcome to Rumor. Your application has been approved!",
    PushNotification: true,
    appNotification: false,
  },
  profileReferrals: {
    pushMessage:
      "[Linked User Name] has requested your referral to Rumor. Tap to refer them now! ",
    appMessage:
      "[Linked User Name] has requested your referral to become a Rumor member. ",
    appNotification: true,
    pushNotification: true,
    body: { userId: "" },
    linkedUser: "",
  },
  eventReminder: {
    pushMessage:
      "Just a reminder, you are scheduled to attend [Event Name] tomorrow at [Event Start Time].",
    appNotification: false,
    pushNotification: true,
    body: { eventId: "" },
    linkedEvent: "",
  },
  eventCancelled: {
    pushMessage: "Hi [Recipient Name], [Event Name] has been canceled.",
    appMessage: "[Linked User Name] canceled [Event Name] ",
    pushNotification: true,
    appNotification: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  eventInvitation: {
    pushMessage: "You've received an invite to attend [Event Name]! Tap to RSVP.",
    appMessage: "[Linked User Name] invited you to attend [Event Name] ",
    appNotification: true,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  eventPosted: {
    pushMessage: "[Linked User Name] just posted a new event. Check it out now. ",
    appMessage: "[Linked User Name] just published a new event [Event Name]",
    appNotification: true,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  eventPostedCity: {
    pushMessage:
      "[Linked User Name] just posted a new event in [Event City Name]. Check it out now. ",
    appMessage:
      "A new event [Event Name] was just published in [Event City Name]",
    appNotification: true,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
    linkedCity: "",
  },
  eventRequestDenied: {
    pushMessage:
      "Your request for [Event Name] was declined. Check out other events on Rumor.",
    appMessage: "Your request to attend [Event Name] has been declined.",
    appNotification: true,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedEvent: "",
  },
  eventVouch: {
    pushMessage:
      "[Linked User Name] has requested your vouch to attend [Event Name]. Tap to refer them now!",
    appMessage: "[Linked User Name] has requested for you to vouch for them.",
    appNotification: true,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  eventAnnouncement: {
    pushMessage:
      "[Linked User Name] just posted a new event announcement for [Event Name]. Tap to view.",
    appMessage: "[Linked User Name] posted a new announcement for [Event Name]",
    appNotification: true,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  signUpFormApproved: {
    pushMessage: "",
    appMessage: "[Linked User Name] approved your request to attend [Event Name]",
    appNotification: true,
    pushNotificaton: false,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  signUpFormRejected: {
    pushMessage: "",
    appMessage: "[Linked User Name] declined your request to attend [Event Name]",
    appNotification: true,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  eventSubmissionApproved: {
    pushMessage:
      "[Event Name] is live on Rumor! Tap to send invites and manage your guest list. (Links to Event details page in host app)",
    appMessage: "Rumor has approved your event [Event Name]",
    appNotification: true,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedEvent: "",
  },
  userApplication: {
    pushMessage: "",
    appMessage: "[Linked User Name] submitted a New User Application",
    appNotification: true,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  hostApplication: {
    pushMessage: "",
    appMessage: "[Linked User Name] submitted a New Host Application",
    appNotification: true,
    pushNotificaton: false,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  eventSubmitted: {
    pushMessage: "",
    appMessage: "[Linked User Name] submitted a new event [Event Name]",
    appNotification: false,
    pushNotificaton: true,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  eventEdited: {
    pushMessage: "",
    appMessage: "[Linked User Name] made edits to [Event Name]",
    appNotification: true,
    pushNotificaton: false,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  hostReport: {
    pushMessage: "",
    appMessage: "[Linked User Name] submitted a report against [Member Name]",
    appNotification: true,
    pushNotificaton: false,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  hostFeedback: {
    pushMessage: "",
    appMessage: "[Linked User Name] submitted feedback",
    appNotification: true,
    pushNotificaton: false,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  userReport: {
    pushMessage: "",
    appMessage: "[Linked User Name] submitted a report against [Host Name]",
    appNotification: true,
    pushNotificaton: false,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  },
  userFeedback: {
    pushMessage: "",
    appMessage: "[Linked User Name] submitted feedback",
    appNotification: true,
    pushNotificaton: false,
    body: { eventId: "" },
    linkedUser: "",
    linkedEvent: "",
  }
};


function getNotificationDetails(notificationType: string):any {
    const notification = notificationMatrix[notificationType as keyof typeof notificationMatrix];
  
    if (!notification) {
      throw new Error(`Invalid notification type: ${notificationType}`);
    }
  
    return { notificationType, ...notification };
}

export default getNotificationDetails


