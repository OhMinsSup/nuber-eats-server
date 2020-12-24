import { Inject, Injectable } from '@nestjs/common';
import got from 'got';
import * as FormData from 'form-data';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfeace';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  private async sendEmail(
    to: string,
    subject: string,
    template: string,
    emailVars: EmailVar[],
  ): Promise<boolean> {
    const form = new FormData();
    form.append(
      'from',
      `Veloss from Nuber Eats <mailgun@${this.options.domain}>`,
    );
    form.append('to', to);
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach(eVar => form.append(`v:${eVar.key}`, eVar.value));

    try {
      return new Promise(async (resolve, reject) => {
        await got
          .post(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
            headers: {
              Authorization: `Basic ${Buffer.from(
                `api:${this.options.apiKey}`,
              ).toString('base64')}`,
            },
            body: form,
          })
          .then(_ => {
            resolve(true);
          })
          .catch(reject);
      });
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  sendVerificationEmail(email: string, username: string, code: string) {
    this.sendEmail(email, '이메일 인증', 'email_template', [
      { key: 'code', value: code },
      { key: 'username', value: username },
    ]);
  }
}
