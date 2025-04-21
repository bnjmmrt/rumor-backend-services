import * as fs from 'fs';
import { camelCase } from 'lodash';
import type { CsvRecord } from '../shared/users/grpc/auth/auth.pb';
import axios from 'axios';
import * as parse from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { COUNTRY_CALLING_CODES } from '../shared/constants/country-code.constants';

export async function parseCsv(file: string): Promise<CsvRecord[]> {
  const records: CsvRecord[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(parse())
      .on('data', (data: Record<string, string>) => {
        const row = toCamelCase(data) as unknown as CsvRecord;
        records.push(row);
      })
      .on('end', () => resolve(records))
      .on('error', (error: Error) => reject(error));
  });
}

export async function generateErrorCsv(failedRecords: CsvRecord[]): Promise<Buffer> {
  const fileName = `/tmp/failed_records_${Date.now()}.csv`;
  const records = failedRecords.map(record => ({
    firstName: record.firstName,
    lastName: record.lastName,
    email: record.email,
    phoneNumber: record.phoneNumber,
    reason: record.reason,
  }));

  const csvWriter = createObjectCsvWriter({
    path: fileName,
    header: [
      { id: 'firstName', title: 'First Name' },
      { id: 'lastName', title: 'Last Name' },
      { id: 'email', title: 'Email' },
      { id: 'phoneNumber', title: 'Phone Number' },
      { id: 'reason', title: 'Reason' },
    ],
  });

  await csvWriter.writeRecords(records);
  return fs.readFileSync(fileName);
}

function toCamelCase<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const newObj: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    newObj[camelCase(key)] = value;
  }
  return newObj;
}

export const isValidEmail = (email: string): boolean => {
  const trimmedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmedEmail);
};

export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const cleaned = phoneNumber.replace(/[\s\-()]/g, '');
  const matchedPrefix = COUNTRY_CALLING_CODES.find(prefix => cleaned.startsWith(prefix));
  if (!matchedPrefix) {
    return false;
  }
  const numberWithoutPrefix = cleaned.slice(matchedPrefix.length);
  // Check if remaining is 10 digits and numeric
  return /^\d{10}$/.test(numberWithoutPrefix);
};

export const processCsvFile = async (
  fileUrl: string,
  isUploadUser: boolean,
): Promise<{ validData: CsvRecord[]; garbageData: CsvRecord[] }> => {
  try {
    // Step 1: Fetch the file from the S3 pre-signed URL
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const fileBuffer = Buffer.from(response.data);

    // Step 2: Save the file temporarily
    const tempFilePath = `/tmp/uploaded_guests_${Date.now()}.csv`;
    await fs.promises.writeFile(tempFilePath, fileBuffer);

    // Step 3: Parse the CSV file
    const records: CsvRecord[] = await parseCsv(tempFilePath);
    if (records.length === 0) {
      throw new Error('Invalid CSV');
    }
    const validData: CsvRecord[] = [];
    const garbageData: CsvRecord[] = [];

    // Step 4: Validate and separate records
    for (const record of records) {
      let reasons: string[] = [];

      // Basic validation
      if (!record.firstName) reasons.push('First Name is required');
      if (!record.lastName) reasons.push('Last Name is required');

      const rawPhone = record.phoneNumber?.toString().trim() || '';
      const rawEmail = record.email?.toString().trim() || '';

      if (isUploadUser) {
        // At least one of email or phone number must be present
        if (!rawEmail && !rawPhone) {
          reasons.push('Either Email or Phone Number is required');
        }

        if (rawEmail && !isValidEmail(rawEmail)) {
          reasons.push('Invalid Email format');
        }

        if (rawPhone && !isValidPhoneNumber(rawPhone)) {
          reasons.push('Invalid Phone Number format');
        }
      } else {
        // Email is mandatory
        if (!rawEmail) {
          reasons.push('Email is required');
        } else if (!isValidEmail(rawEmail)) {
          reasons.push('Invalid Email format');
        }
      }

      if (reasons.length > 0) {
        record.reason = reasons.join(', ');
        garbageData.push(record);
      } else {
        record.firstName = record.firstName?.toString().trim();
        record.lastName = record.lastName?.toString().trim();
        record.phoneNumber = rawPhone.replace(/[\s\-()]/g, '');
        record.email = rawEmail.trim().toLowerCase();
        validData.push(record);
      }
    }

    return { validData, garbageData };
  } catch (error) {
    throw new Error(`Error processing CSV file: ${error.message}`);
  }
};
