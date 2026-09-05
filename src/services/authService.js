/**
 * Authentication Service
 * Implements future-proof schemas based on:
 * 1. ABDM (Ayushman Bharat Digital Mission) Gateway APIs (M1/M2/M3 milestones)
 * 2. UIDAI Aadhaar e-KYC OTP Authentication Specifications
 * 3. Hospital OPD Mobile OTP Gateway
 *
 * Currently simulates the backend responses while adhering to the official data structures.
 */

// Official ABDM & UIDAI Auth Mode constants
export const AUTH_METHODS = {
  ABHA: "ABHA",
  AADHAAR: "AADHAAR",
  MOBILE: "MOBILE",
};

/**
 * Request OTP for ABHA (14-digit Ayushman Bharat Health Account)
 * Follows ABDM API: POST /v0.5/users/auth/init
 * Request Body Schema: { authMethod: "AADHAAR_OTP" | "MOBILE_OTP", healhtid: string }
 * Response Schema: { transactionId: string, authModes: string[], maskedMobile: string }
 */
export async function requestAbhaOtp(abhaNumber) {
  // TODO: Replace with official ABDM Gateway API call:
  // const response = await axios.post(`${ABDM_GATEWAY_URL}/v0.5/users/auth/init`, {
  //   authMethod: "AADHAAR_OTP",
  //   healhtid: abhaNumber.replace(/-/g, ''),
  // }, { headers: { "X-CM-ID": "sbx", Authorization: `Bearer ${gatewayToken}` } });
  // return response.data;

  return new Promise((resolve) => {
    setTimeout(() => {
      const cleanNumber = abhaNumber.replace(/\D/g, "");
      resolve({
        success: true,
        transactionId: `txn_abdm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        authMode: "AADHAAR_OTP",
        maskedMobile: "+91 ******3210",
        message: "OTP dispatched to Aadhaar-registered mobile number",
        expiresInSeconds: 600,
      });
    }, 400);
  });
}

/**
 * Verify OTP for ABHA Number
 * Follows ABDM API: POST /v0.5/users/auth/confirmWithAadhaarOtp
 * Request Body Schema: { transactionId: string, otp: string }
 * Response Schema: { token: string, user: PatientProfile }
 */
export async function verifyAbhaOtp(transactionId, otp, abhaNumber) {
  // TODO: Replace with official ABDM API call:
  // const response = await axios.post(`${ABDM_GATEWAY_URL}/v0.5/users/auth/confirmWithAadhaarOtp`, {
  //   transactionId,
  //   otp
  // });
  // return response.data;

  return new Promise((resolve) => {
    setTimeout(() => {
      const cleanNumber = abhaNumber ? abhaNumber.replace(/\D/g, "") : "91443288129012";
      const formattedAbha = cleanNumber.length === 14
        ? `${cleanNumber.slice(0, 2)}-${cleanNumber.slice(2, 6)}-${cleanNumber.slice(6, 10)}-${cleanNumber.slice(10, 14)}`
        : "91-4432-8812-9012";

      resolve({
        success: true,
        token: `jwt_abdm_token_${Date.now()}`,
        patient: {
          id: `pat_${cleanNumber.slice(-8)}`,
          name: "Rajesh Kumar Sharma",
          hindiName: "राजेश कुमार शर्मा",
          gender: "Male",
          age: 42,
          dob: "1984-06-15",
          mobile: "+91 98765 43210",
          abhaNumber: formattedAbha,
          abhaAddress: "rajesh.sharma@abdm",
          bloodGroup: "B+",
          district: "Central Delhi",
          state: "Delhi",
          authMethod: AUTH_METHODS.ABHA,
          verifiedAt: new Date().toISOString(),
        },
      });
    }, 600);
  });
}

/**
 * Request OTP for 12-digit Aadhaar Number
 * Follows UIDAI Aadhaar Auth API Schema: POST /api/v1/auth/aadhaar/generate-otp
 * Request Schema: { aadhaarNumber: string, consent: boolean }
 * Response Schema: { txnId: string, status: "SUCCESS", maskedMobile: string }
 */
export async function requestAadhaarOtp(aadhaarNumber) {
  // TODO: Replace with UIDAI certified e-KYC provider endpoint
  // const response = await axios.post('/api/v1/auth/aadhaar/generate-otp', {
  //   aadhaarNumber: aadhaarNumber.replace(/\s/g, ''),
  //   consent: true
  // });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        txnId: `txn_uidai_${Date.now()}`,
        maskedMobile: "+91 ******6789",
        message: "OTP sent to UIDAI registered mobile number",
        expiresInSeconds: 300,
      });
    }, 400);
  });
}

/**
 * Verify OTP for Aadhaar
 * Follows UIDAI API: POST /api/v1/auth/aadhaar/verify-otp
 * Request Schema: { txnId: string, otp: string }
 * Response Schema: { eKycData: { uid: string, name: string, ... } }
 */
export async function verifyAadhaarOtp(txnId, otp, aadhaarNumber) {
  // TODO: Replace with UIDAI e-KYC response parsing
  return new Promise((resolve) => {
    setTimeout(() => {
      const clean = aadhaarNumber ? aadhaarNumber.replace(/\D/g, "") : "728891230144";
      const maskedUid = `XXXXXXXX${clean.slice(-4)}`;

      resolve({
        success: true,
        token: `jwt_aadhaar_token_${Date.now()}`,
        patient: {
          id: `pat_aadhaar_${clean.slice(-6)}`,
          name: "Sunita Devi",
          hindiName: "सुनीता देवी",
          gender: "Female",
          age: 47,
          dob: "1978-11-20",
          mobile: "+91 91234 56789",
          abhaNumber: "72-8891-2301-4455",
          aadhaarNumber: maskedUid,
          bloodGroup: "O+",
          district: "Varanasi",
          state: "Uttar Pradesh",
          authMethod: AUTH_METHODS.AADHAAR,
          verifiedAt: new Date().toISOString(),
        },
      });
    }, 600);
  });
}

/**
 * Request OTP for 10-digit Indian Mobile Number
 * Follows Hospital OPD OTP API: POST /api/v1/auth/mobile/otp
 * Request Schema: { mobile: string }
 */
export async function requestMobileOtp(mobileNumber) {
  // TODO: Replace with Hospital SMS Gateway / Twilio / Kaleyra API:
  // const response = await axios.post('/api/v1/auth/mobile/otp', { mobile: mobileNumber });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        txnId: `txn_sms_${Date.now()}`,
        maskedMobile: `+91 ${mobileNumber.slice(0, 2)}******${mobileNumber.slice(-2)}`,
        message: "SMS OTP sent successfully",
        expiresInSeconds: 300,
      });
    }, 400);
  });
}

/**
 * Verify OTP for Mobile
 * Follows Hospital OPD API: POST /api/v1/auth/mobile/verify
 */
export async function verifyMobileOtp(txnId, otp, mobileNumber) {
  // TODO: Replace with Hospital Auth Service
  return new Promise((resolve) => {
    setTimeout(() => {
      const clean = mobileNumber ? mobileNumber.replace(/\D/g, "") : "9876543210";
      resolve({
        success: true,
        token: `jwt_mobile_token_${Date.now()}`,
        patient: {
          id: `pat_mob_${clean.slice(-6)}`,
          name: "Rajesh Kumar Sharma",
          hindiName: "राजेश कुमार शर्मा",
          gender: "Male",
          age: 42,
          dob: "1984-06-15",
          mobile: `+91 ${clean}`,
          abhaNumber: "91-4432-8812-9012",
          bloodGroup: "B+",
          district: "Central Delhi",
          state: "Delhi",
          authMethod: AUTH_METHODS.MOBILE,
          verifiedAt: new Date().toISOString(),
        },
      });
    }, 600);
  });
}
