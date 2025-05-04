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

export const urlImage = process.env.NEXT_ENVIRONMENT === "production" ? "https://cwwhcovvbxkoadyuhofj.supabase.co/storage/v1/object/public/prod/" :
    "https://cwwhcovvbxkoadyuhofj.supabase.co/storage/v1/object/public/dev/";

export const eventsTable = process.env.NEXT_ENVIRONMENT === "production" ? "events_prod" : "events_dev";
export const landingPageTable = process.env.NEXT_ENVIRONMENT === "production" ? "landingpage_prod" : "landingpage_dev";
export const formFieldsTable = process.env.NEXT_ENVIRONMENT === "production" ? "fields_prod" : "fields_dev";
export const participantsTable = process.env.NEXT_ENVIRONMENT === "production" ? "participants_prod" : "participants_dev";

export const storageBucket = process.env.NEXT_ENVIRONMENT === "production" ? "prod" : "dev";