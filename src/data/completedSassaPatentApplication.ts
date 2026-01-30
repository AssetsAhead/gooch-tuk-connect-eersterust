// CIPC Provisional Patent Application - SASSA Grant Verification System
// Application Package: Forms P1, P3, P6, P26 (South African Provisional Patent)
// Status: Ready for CIPC e-Services Portal Submission

export const completedSassaPatentApplication = {
  // APPLICANT INFORMATION (Common to all forms)
  applicant: {
    fullName: "Malcolm Gerard Johnston",
    idNumber: "7404025115087",
    address: "308 Zelik Glynelaan, Eersterust, Pretoria 0022",
    phone: "+27826370673",
    email: "assetsahead.sa@gmail.com",
    nationality: "South African",
    capacity: "Individual Inventor / Sole Applicant"
  },

  // FORM P1 - APPLICATION FOR A PATENT
  formP1: {
    formNumber: "P1",
    title: "APPLICATION FOR A PATENT",
    filingDate: new Date().toISOString().split('T')[0],
    
    inventionTitle: "AI-Powered SASSA Grant Card Verification and Discount Qualification System Using Mobile Device Image Analysis",
    
    patentType: "Provisional Patent Application",
    
    applicantDetails: {
      name: "Malcolm Gerard Johnston",
      address: "308 Zelik Glynelaan, Eersterust, Pretoria 0022",
      nationality: "South African",
      residency: "Republic of South Africa"
    },
    
    inventorDetails: {
      name: "Malcolm Gerard Johnston",
      address: "308 Zelik Glynelaan, Eersterust, Pretoria 0022",
      isApplicantInventor: true
    },
    
    priorityClaim: null, // No priority claim - original filing
    
    accompanyingDocuments: [
      "Form P3 - Declaration",
      "Form P6 - Specification (Provisional)",
      "Form P26 - Declaration regarding Indigenous Biological Resources"
    ],
    
    fees: {
      applicationFee: 250, // ZAR for P1
      currency: "ZAR",
      paymentMethod: "CIPC Customer Account"
    }
  },

  // FORM P3 - DECLARATION
  formP3: {
    formNumber: "P3",
    title: "DECLARATION BY APPLICANT(S) OR INVENTOR(S)",
    
    declaration: {
      inventorStatement: "I, Malcolm Gerard Johnston, declare that I am the true and first inventor of the invention entitled 'AI-Powered SASSA Grant Card Verification and Discount Qualification System Using Mobile Device Image Analysis'.",
      
      noveltyStatement: "To the best of my knowledge and belief, the invention is novel and was not publicly known or used in South Africa or elsewhere before the priority date of this application.",
      
      nonObviousnessStatement: "The invention involves an inventive step that is not obvious to a person skilled in the art of AI-powered document verification and mobile application development.",
      
      rightToProceed: "I am entitled to apply for and be granted a patent for the invention in my own name.",
      
      derivationStatement: "The invention was not derived from another person who is entitled to apply for a patent."
    },
    
    signature: {
      declarant: "Malcolm Gerard Johnston",
      date: new Date().toISOString().split('T')[0],
      place: "Pretoria, South Africa"
    },
    
    fees: {
      declarationFee: 60, // ZAR for P3
      currency: "ZAR"
    }
  },

  // FORM P6 - SPECIFICATION (PROVISIONAL)
  formP6: {
    formNumber: "P6",
    title: "SPECIFICATION (PROVISIONAL)",
    
    inventionTitle: "AI-Powered SASSA Grant Card Verification and Discount Qualification System Using Mobile Device Image Analysis",
    
    technicalField: `
The present invention relates to the field of AI-powered document verification systems, specifically to methods and apparatus for authenticating South African Social Security Agency (SASSA) grant beneficiary cards using mobile device camera capture and artificial intelligence analysis, integrated with real-time discount qualification determination for service providers including informal transport operators.
    `.trim(),
    
    backgroundOfInvention: `
SASSA (South African Social Security Agency) distributes approximately 18 million social grants monthly to vulnerable citizens including older persons, persons with disabilities, and child support recipients. These beneficiaries often face financial hardship and would benefit significantly from discounted services, particularly in informal transport sectors.

Current verification methods for grant beneficiary status suffer from several deficiencies:

1. MANUAL DOCUMENT INSPECTION: Requires physical presentation of cards at each transaction, subject to human error in authenticity assessment, time-consuming for high-volume service providers, and susceptible to document fraud through photocopies or expired cards.

2. CENTRALIZED DATABASE QUERIES: Require real-time internet connectivity unavailable in many township areas, rely on SASSA API infrastructure which may experience downtime, expose sensitive personal information through network transmissions, and create dependency on government system availability.

3. LACK OF INTEGRATION WITH INFORMAL ECONOMY: Township transport operators (minibus taxis, tuk-tuks) have no practical method to verify beneficiary status, discounts cannot be systematically applied, and operators bear financial burden of offering unverified discounts.

4. PRIVACY AND DIGNITY CONCERNS: Beneficiaries must publicly display sensitive documents, no secure storage mechanism for verification evidence, and repeated verification creates friction and stigma.

Prior art systems for document verification using AI focus primarily on identity documents and do not address the specific characteristics of SASSA grant cards, their unique security features, or integration with discount management systems for informal economy service providers.

There exists a need for a verification system that can authenticate SASSA cards using mobile device cameras, operate with limited or no internet connectivity, respect beneficiary privacy while providing reliable verification, and integrate seamlessly with service provider payment and discount systems.
    `.trim(),
    
    summaryOfInvention: `
The present invention provides an AI-powered verification system comprising:

A. A mobile device application enabling secure capture of SASSA grant card images using device cameras with guided framing and quality validation.

B. An artificial intelligence analysis module utilizing computer vision and machine learning to authenticate card features including:
   - SASSA logo and branding elements verification
   - Card layout and typography validation
   - Holographic and security feature detection (where visible)
   - Expiry date extraction and validity checking
   - Grant type identification (Old Age, Disability, Child Support, etc.)

C. A secure cloud-based processing pipeline using serverless edge functions for:
   - Image preprocessing and enhancement
   - AI model inference using Gemini 2.5 Flash vision capabilities
   - Structured data extraction with confidence scoring
   - Results caching for offline verification capabilities

D. A verification status storage system utilizing:
   - Encrypted user-linked verification records
   - Time-limited approval periods (configurable, default 3 months)
   - Secure signed URL access to verification evidence
   - Audit trail for compliance requirements

E. An automatic discount qualification engine that:
   - Determines applicable discount rates based on verified grant type
   - Integrates with payment collection interfaces
   - Calculates adjusted fares for transport services
   - Generates discount application records for accounting

F. A privacy-preserving architecture featuring:
   - Minimal data retention policies
   - User-controlled access to verification status
   - No storage of raw identity document data
   - Consent-based information sharing with service providers

The system addresses the unique challenges of verifying government benefit cards in environments with limited connectivity, high transaction volumes, and significant fraud risk, while respecting the dignity and privacy of vulnerable populations.
    `.trim(),
    
    detailedDescription: `
DETAILED TECHNICAL DESCRIPTION

1. SYSTEM ARCHITECTURE OVERVIEW

The invention comprises a distributed system with the following major components:

1.1 Client Application Layer
- React-based progressive web application with Capacitor integration for native device capabilities
- Camera access module with real-time framing guidance overlay
- Local image quality validation before upload
- Offline verification cache for previously validated cards
- Integration with existing transport service and payment interfaces

1.2 Edge Processing Layer
- Supabase Edge Functions deployed on global edge network
- Image preprocessing pipeline:
  * Automatic orientation correction using EXIF data
  * Contrast and brightness normalization
  * Noise reduction and sharpening for text clarity
  * Region-of-interest extraction for card boundaries
- Rate limiting and abuse prevention mechanisms
- Authentication token validation for secure function invocation

1.3 AI Analysis Engine
- Google Gemini 2.5 Flash vision model integration via Lovable AI Gateway
- Structured prompt engineering for SASSA card analysis:
  * Card authenticity assessment (genuine/suspicious/invalid)
  * Grant type extraction (OLDER_PERSONS, DISABILITY, CHILD_SUPPORT, etc.)
  * Expiry date parsing with format normalization
  * Confidence scoring across multiple verification dimensions
- Tool calling interface for structured JSON output generation
- Fallback logic for model uncertainty handling

1.4 Secure Storage Layer
- Supabase PostgreSQL with Row Level Security (RLS) policies
- Tables: sassa_verifications (user_id, card_photo_path, verification_status, grant_type, expiry_date, verified_at, confidence_score)
- Supabase Storage bucket with signed URL access control
- Automatic expiration of verification records based on configurable retention periods

1.5 Payment Integration Layer
- Yoco payment gateway integration
- Discount calculation engine with grant-type-specific rates:
  * OLDER_PERSONS: 25% discount
  * DISABILITY: 30% discount  
  * CHILD_SUPPORT: 15% discount for accompanying children
- Fare adjustment applied before payment processing
- Transaction records linking discount to verification

2. VERIFICATION WORKFLOW

2.1 Card Capture Phase
- User initiates verification from passenger dashboard
- Camera interface displays with SASSA card outline overlay
- Real-time edge detection confirms card positioning
- Multiple exposure optimization for various lighting conditions
- Single-tap capture with automatic quality assessment
- Retake prompt if quality threshold not met (blur detection, brightness check)

2.2 Upload and Processing Phase
- Image compressed with quality preservation (JPEG 85% quality)
- Secure upload to signed storage URL
- Edge function triggered via POST request with image path
- Preprocessing applied: resize to 1024px max dimension, format normalization

2.3 AI Analysis Phase
- Vision model prompt constructed:
  "Analyze this image of a South African SASSA grant card. Determine:
   1. Is this a genuine SASSA card? Look for official logo, proper formatting, security features
   2. What type of grant does it represent?
   3. What is the expiry date?
   4. Confidence level in your assessment (0-100)"
   
- Tool calling response structure:
  {
    isValid: boolean,
    grantType: "OLDER_PERSONS" | "DISABILITY" | "CHILD_SUPPORT" | "OTHER",
    expiryDate: string (YYYY-MM-DD),
    confidence: number (0-100),
    issues: string[] // any concerns detected
  }

- Confidence threshold enforcement: 
  * ≥80%: Automatic approval
  * 60-79%: Manual review flag with provisional approval
  * <60%: Rejection with guidance for resubmission

2.4 Status Recording Phase
- Verification result stored in sassa_verifications table
- RLS policy ensures user can only access own records
- Card photo retained in secure storage with time-limited signed URLs
- Notification sent to user with verification outcome
- Admin audit log entry created for compliance

2.5 Discount Application Phase
- Service provider checks passenger verification status
- If verified and not expired:
  * Grant type determines discount percentage
  * Discount applied to calculated fare
  * Payment processed at reduced amount
- Transaction record includes verification reference for audit trail

3. SECURITY FEATURES

3.1 Client-Side Security
- Certificate pinning for API communications
- Secure storage for authentication tokens
- No caching of raw card images on device
- Session timeout with automatic reauthentication

3.2 Server-Side Security
- Row Level Security enforcing user data isolation
- Edge function authentication via Supabase JWT
- Signed URLs with configurable expiration (1 hour default for viewing)
- Server-side generation of signed URLs option for enhanced security
- Rate limiting: 5 verification attempts per day per user

3.3 AI Model Security
- Prompt injection prevention through structured input sanitization
- Model output validation against expected schema
- Confidence scoring to detect adversarial inputs
- Human review queuing for edge cases

4. OFFLINE OPERATION

4.1 Verification Caching
- Successful verifications cached locally with expiry timestamp
- Cache encrypted using device-specific key
- Automatic cache invalidation when verification expires
- Visual indicator shows cached vs. live verification status

4.2 Queue for Connectivity
- Failed uploads queued for retry when connectivity restored
- Background sync process attempts upload at intervals
- User notified of pending verifications
- Stale queue items expired after 72 hours

5. ADMINISTRATIVE FEATURES

5.1 Verification Dashboard
- Admin view of all pending manual review cases
- Bulk approval/rejection capability
- Fraud pattern detection analytics
- Monthly verification volume reports

5.2 Discount Analytics
- Total discounts applied per grant type
- Average discount value trends
- Service provider adoption metrics
- Beneficiary satisfaction indicators
    `.trim(),
    
    claims: [
      // Independent Claims
      {
        number: 1,
        type: "independent",
        text: "A computer-implemented method for verifying SASSA grant beneficiary status comprising: capturing an image of a SASSA grant card using a mobile device camera; transmitting the image to a cloud-based edge function; processing the image using an artificial intelligence vision model to determine card authenticity and extract grant information; storing verification results in a secure database with user-linked access controls; and providing a verification status response for discount qualification determination."
      },
      {
        number: 2,
        type: "independent",
        text: "A system for automated social grant card verification and discount application comprising: a mobile application with camera capture interface; an edge processing layer for image preprocessing and AI model invocation; a vision-based AI analysis module configured to assess card authenticity and extract grant type and expiry information; a secure storage system for verification records; and a discount engine that calculates adjusted pricing based on verified grant type."
      },
      {
        number: 3,
        type: "independent",
        text: "A non-transitory computer-readable medium storing instructions that, when executed by a processor, cause the processor to: receive a captured image of a government benefit card; invoke an AI vision model with structured prompts for authenticity verification; parse model response to extract verification outcome, grant classification, and confidence score; persist verification status with user association and expiration management; and expose verification status to integrated service provider systems for discount determination."
      },
      
      // Dependent Claims
      {
        number: 4,
        type: "dependent",
        dependsOn: 1,
        text: "The method of claim 1, wherein the artificial intelligence vision model is a multimodal large language model with vision capabilities, specifically Google Gemini 2.5 Flash accessed via API gateway."
      },
      {
        number: 5,
        type: "dependent",
        dependsOn: 1,
        text: "The method of claim 1, further comprising: applying a confidence threshold to the AI analysis results; automatically approving verifications with confidence scores at or above 80%; flagging verifications with confidence scores between 60% and 79% for manual review; and rejecting verifications with confidence scores below 60%."
      },
      {
        number: 6,
        type: "dependent",
        dependsOn: 1,
        text: "The method of claim 1, wherein storing verification results includes: generating a signed URL for secure access to the card image; setting an expiration period for the signed URL; and logging an audit trail entry for compliance purposes."
      },
      {
        number: 7,
        type: "dependent",
        dependsOn: 2,
        text: "The system of claim 2, wherein the discount engine applies different discount rates based on grant type, including: 25% discount for Older Persons Grant; 30% discount for Disability Grant; and 15% discount for Child Support Grant beneficiaries."
      },
      {
        number: 8,
        type: "dependent",
        dependsOn: 2,
        text: "The system of claim 2, further comprising an offline verification cache that stores successful verification records locally with encryption for use when network connectivity is unavailable."
      },
      {
        number: 9,
        type: "dependent",
        dependsOn: 2,
        text: "The system of claim 2, wherein the secure storage system implements Row Level Security policies ensuring users can only access their own verification records."
      },
      {
        number: 10,
        type: "dependent",
        dependsOn: 3,
        text: "The computer-readable medium of claim 3, wherein the structured prompts include instructions to identify: SASSA logo and branding authenticity; card layout and typography conformance; grant type classification; and expiry date extraction with format normalization."
      },
      {
        number: 11,
        type: "dependent",
        dependsOn: 1,
        text: "The method of claim 1, further comprising rate limiting verification attempts to prevent abuse, wherein users are limited to a maximum of five verification attempts per day."
      },
      {
        number: 12,
        type: "dependent",
        dependsOn: 2,
        text: "The system of claim 2, further comprising an administrative dashboard providing: pending manual review queue; bulk approval and rejection capability; fraud pattern detection analytics; and verification volume reporting."
      }
    ],
    
    abstract: `
A system and method for AI-powered verification of South African Social Security Agency (SASSA) grant beneficiary cards using mobile device image capture and artificial intelligence analysis. The invention comprises a mobile application for card image capture, an edge processing pipeline for image enhancement, a vision-based AI analysis module utilizing multimodal large language models to assess card authenticity and extract grant information, a secure storage system with Row Level Security policies for verification records, and a discount calculation engine for automatic fare adjustment based on verified grant type. The system addresses challenges of verifying government benefit documents in environments with limited connectivity while respecting beneficiary privacy, preventing fraud, and enabling systematic application of social welfare discounts in informal economy settings.
    `.trim(),
    
    drawings: {
      description: "System Architecture and Workflow Diagrams",
      figures: [
        {
          number: 1,
          title: "System Architecture Overview",
          description: "Block diagram showing client application, edge processing layer, AI analysis engine, secure storage, and payment integration components"
        },
        {
          number: 2,
          title: "Verification Workflow Sequence",
          description: "Sequence diagram illustrating the flow from card capture through AI analysis to discount application"
        },
        {
          number: 3,
          title: "AI Analysis Module Detail",
          description: "Detailed view of vision model prompt structure, tool calling interface, and confidence threshold logic"
        },
        {
          number: 4,
          title: "Database Schema",
          description: "Entity-relationship diagram showing sassa_verifications table, user associations, and storage bucket references"
        },
        {
          number: 5,
          title: "Mobile Application User Interface",
          description: "Mockup screens showing camera capture interface with card positioning overlay and verification result display"
        }
      ]
    }
  },

  // FORM P26 - DECLARATION REGARDING INDIGENOUS BIOLOGICAL RESOURCES
  formP26: {
    formNumber: "P26",
    title: "DECLARATION REGARDING INDIGENOUS BIOLOGICAL RESOURCES, GENETIC RESOURCES, OR TRADITIONAL KNOWLEDGE OR USE",
    
    declaration: {
      statement: "The invention described in the accompanying specification does not involve the use of, or is not based on, any indigenous biological resource, genetic resource, or traditional knowledge or use.",
      
      explanation: "This invention relates to software systems, artificial intelligence analysis, and digital verification methods. It does not involve, derive from, or incorporate any biological resources, genetic materials, or traditional knowledge."
    },
    
    signature: {
      declarant: "Malcolm Gerard Johnston",
      date: new Date().toISOString().split('T')[0],
      place: "Pretoria, South Africa"
    }
  },

  // FILING SUMMARY
  filingSummary: {
    totalForms: 4,
    forms: ["P1", "P3", "P6", "P26"],
    estimatedFees: {
      P1: 250,
      P3: 60,
      total: 310,
      currency: "ZAR"
    },
    filingMethod: "CIPC e-Services Portal",
    submissionURL: "https://eservices.cipc.co.za",
    bankDetails: {
      bank: "ABSA",
      accountNumber: "4053620095",
      branchCode: "632005",
      reference: "Customer Code (obtain from CIPC portal)"
    },
    nextSteps: [
      "1. Log in to CIPC e-Services portal",
      "2. Top up Customer Account with R310 using your Customer Code as EFT reference",
      "3. Navigate to Patents section and select 'Provisional Patent Application'",
      "4. Upload completed P1, P3, P6, and P26 forms",
      "5. Pay fees from Customer Account balance",
      "6. Download and retain application acknowledgment receipt",
      "7. Note application number for PCT filing within 12 months if international protection desired"
    ],
    provisionalTerms: {
      validityPeriod: "12 months from filing date",
      conversionDeadline: "Must file complete specification (Form P9) within 12 months to maintain protection",
      pctOption: "May file PCT international application within 12 months claiming priority from this provisional"
    }
  },

  // PRIOR ART ANALYSIS
  priorArtAnalysis: {
    searchConducted: true,
    riskLevel: "MODERATE",
    existingPatents: [
      {
        reference: "Various document verification patents",
        distinction: "Existing patents focus on identity documents (passports, driver's licenses). No patents specifically address SASSA grant card verification or integration with informal transport discount systems."
      },
      {
        reference: "AI-based OCR and document analysis patents",
        distinction: "Prior art uses OCR for data extraction. This invention uniquely combines authenticity assessment with grant type classification and expiry validation specific to South African social welfare cards."
      }
    ],
    noveltyFactors: [
      "First system specifically designed for SASSA grant card verification",
      "Integration of AI vision analysis with offline caching for township environments",
      "Automated discount qualification based on verified grant type",
      "Privacy-preserving architecture with minimal data retention",
      "Edge-based processing optimized for limited connectivity scenarios"
    ],
    commercialDifferentiation: "The system addresses the specific needs of South African informal transport operators who serve SASSA beneficiaries, a market segment with no existing technological solutions."
  }
};

export default completedSassaPatentApplication;
