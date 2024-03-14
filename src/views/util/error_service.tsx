import { ErrorProps } from "../components/error";

export const process_error = (error: any) => {
  // Log to external server
  // Get user friendly message and title
  console.error(error)
  if (error && error.message === '401') {
    const unauth_error: ErrorProps = {error_title: "Your Authorization has expired", error_message: "Please authorize your Friendzy account", type: "unathorized"}
    return unauth_error;
  } 
  const friendly_error: ErrorProps = {error_title: "An error has occurred", error_message: get_error_message(error), type:'critical'}
  return friendly_error
}

const get_error_message = (error: any): string =>  {
  if (error.message) {
    return error.message
  } else {
    console.error('Error has no message. Return full error')
    return JSON.stringify(error)
  }
  
}