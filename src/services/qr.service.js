import QRCode from 'qrcode';

export const generateQRCode = async (data, options = {}) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0B0F0E',
        light: '#F6F7F6'
      },
      ...options
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
};

export const generateTripQRCode = async (tripId, baseUrl) => {
  const tripUrl = `${baseUrl}/trip/${tripId}`;
  return generateQRCode(tripUrl);
};

export const generateTravelModeQRCode = async (tripId, baseUrl) => {
  const travelModeUrl = `${baseUrl}/travel-mode/${tripId}`;
  return generateQRCode(travelModeUrl);
};

export default {
  generateQRCode,
  generateTripQRCode,
  generateTravelModeQRCode
};
