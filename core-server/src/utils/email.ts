import { CreateEmailResponse, Resend } from 'resend';

import { handleErrors } from './errorHandler';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (
  from: string,
  to: string,
  subject: string,
  html: string,
): Promise<CreateEmailResponse | undefined> => {
  try {
    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    return response;
  } catch (error) {
    handleErrors('Sending Email Error:', error as Error);
  }
};
