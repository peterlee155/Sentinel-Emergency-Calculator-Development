module.exports = {
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  presentContactPickerAsync: jest.fn().mockResolvedValue({
    name: 'Jane Doe',
    phoneNumbers: [{ number: '+15559876543' }],
  }),
};
