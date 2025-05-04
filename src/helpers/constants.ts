export const PAGE_URL = {
  SUMMARY:'/',
  EVENT_CREATE:'/event/create',
  EVENT_LIST:'/event/list',
  PARTICIPANT_LIST:'/[eventId]/participant',
  FORM_FIELD_LIST:'/[eventId]/form-fields',
  LANDING_PAGE_MANAGE: '/[eventId]/lp/manage',
  LANDING_PAGE: '/[eventId]/lp',
  LOGIN: "/login"
}

export const urlImage = process.env.NODE_ENV === "production" ? "https://cwwhcovvbxkoadyuhofj.supabase.co/storage/v1/object/public/prod/" :
    "https://cwwhcovvbxkoadyuhofj.supabase.co/storage/v1/object/public/dev/";

export const eventsTable = process.env.NODE_ENV === "production" ? "events_prod" : "events_dev";
export const landingPageTable = process.env.NODE_ENV === "production" ? "landingpage_prod" : "landingpage_dev";
export const formFieldsTable = process.env.NODE_ENV === "production" ? "fields_prod" : "fields_dev";
export const participantsTable = process.env.NODE_ENV === "production" ? "participants_prod" : "participants_dev";

export const storageBucket = process.env.NODE_ENV === "production" ? "prod" : "dev";