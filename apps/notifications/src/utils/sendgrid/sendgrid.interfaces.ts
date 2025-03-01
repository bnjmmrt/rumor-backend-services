import { MailDataRequired } from '@sendgrid/mail';

export interface SendGridModuleOptions {
    apikey: string;
    /**
     * You can set default data
     */
    defaultMailData?: Partial<MailDataRequired>;
    substitutionWrappers?: { left: string; right: string };
}

export type SendGridModuleAsyncOptions = {
    useClass?: new (...args: any[]) => SendGridModuleOptionsFactory;
    /**
     * The factory which should be used to provide the SendGrid options
     */
    useFactory?: (...args: any[]) => Promise<SendGridModuleOptions> | SendGridModuleOptions;
    /**
     * The providers which should get injected
     */
    inject?: any[];
    imports?: any[];
};

export interface SendGridModuleOptionsFactory {
    createSendGridModuleOptions(): Promise<SendGridModuleOptions> | SendGridModuleOptions;
}
