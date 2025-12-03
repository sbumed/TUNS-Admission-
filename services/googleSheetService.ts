import { ApplicationData } from '../types';

// IMPORTANT: This service is currently deactivated as per user request to manage data locally.
// The SCRIPT_URL is kept for potential future re-activation.
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwVtGvti4DX_JBvhWqHJMEpO-9e8uxf1NYB6Hu10mBnYg0egAT2r1yKu42t4-7sfF3T-Q/exec';

// Helper function to convert a file to a Base64 string (without the data URL prefix)
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result;
            if (typeof result === 'string') {
                // The result is "data:mime/type;base64,the_base64_string".
                // We only want to send "the_base64_string" to the backend.
                resolve(result.split(',')[1] || '');
            } else {
                 reject(new Error('Failed to read file as data URL.'));
            }
        };
        reader.onerror = error => reject(error);
    });
};

/**
 * DEACTIVATED: Prepares and sends application data to a Google Sheet via an Apps Script Web App.
 * This function now immediately returns a success state to support local-only data management.
 * The data is saved to localStorage in ApplicationForm.tsx.
 * @param data The application data.
 * @returns A promise that resolves to an object with a success flag and a message.
 */
export const sendApplicationToSheet = async (data: ApplicationData & { seatingInfo?: any }): Promise<{ success: boolean; message: string; }> => {
    // This function is now a no-op as per user request to handle data within the app.
    // Data is saved to localStorage in ApplicationForm.tsx.
    // We return success to maintain the application flow.
    console.log('Online submission to Google Sheets is disabled. Data is saved locally.');
    return Promise.resolve({ success: true, message: 'Local save only.' });

    /* 
    // Original implementation (kept for reference):
    if (!SCRIPT_URL || !SCRIPT_URL.startsWith('https://script.google.com/macros/s/')) {
        const message = 'Google Sheets SCRIPT_URL appears to be invalid or unconfigured. Skipping online submission. The data is still saved locally.';
        console.warn(message);
        return { success: false, message };
    }

    try {
        const dataToSend = { ...data };
        delete (dataToSend as any).seatingInfo;

        const fileFields: (keyof ApplicationData)[] = [
            'photo', 'transcript', 'householdRegistration', 'fatherHouseholdRegistration',
            'motherHouseholdRegistration', 'guardianHouseholdRegistration', 'guardianProof',
            'fatherNationalIdCard', 'motherNationalIdCard', 'guardianNationalIdCard'
        ];
        
        await Promise.all(fileFields.map(async (field) => {
            const file = data[field];
            if (file instanceof File) {
                (dataToSend as any)[field] = await fileToBase64(file);
            }
        }));
        
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(dataToSend),
        });
        
        console.log('Application data submission initiated for ID:', data.applicationId);
        return { success: true, message: 'Submission initiated successfully.' };

    } catch (error) {
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            const message = `Application data for ID ${data.applicationId} sent to Google Sheets (ignored expected CORS redirect error).`;
            console.log(message);
            return { success: true, message };
        } else {
            const message = `An unexpected error occurred while submitting to Google Sheets: ${error instanceof Error ? error.message : String(error)}`;
            console.error(message);
            return { success: false, message };
        }
    }
    */
};