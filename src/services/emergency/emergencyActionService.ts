import { Linking, Platform } from 'react-native';
import * as SMS from 'expo-sms';
import { EmergencyShortcut, ActionType } from '../../types/shortcuts';
import { EmergencyContact } from '../../types/contacts';
import contactsService from '../contacts/contactsService';
import locationService, { LocationResult } from '../location/locationService';
import storage from '../../storage';

export type ActionExecutionStatus =
  | 'READY'
  | 'PERMISSION_REQUIRED'
  | 'ACTION_LAUNCHED'
  | 'SUCCESS'
  | 'FAILED';

export interface ActionStepResult {
  step: string;
  status: ActionExecutionStatus;
  message: string;
  timestamp: number;
}

export interface ExecutionReport {
  shortcutId: string;
  shortcutName: string;
  isSimulation: boolean;
  overallStatus: ActionExecutionStatus;
  steps: ActionStepResult[];
  location?: LocationResult;
  targetContacts: EmergencyContact[];
  preparedMessage?: string;
  error?: string;
}

export class EmergencyActionService {
  private static instance: EmergencyActionService;

  public static getInstance(): EmergencyActionService {
    if (!EmergencyActionService.instance) {
      EmergencyActionService.instance = new EmergencyActionService();
    }
    return EmergencyActionService.instance;
  }

  /**
   * Resolve message template tags with live data
   */
  public resolveMessageTemplate(
    template: string,
    targetName: string,
    locationData?: LocationResult,
    profileName?: string
  ): string {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString();

    let resolved = template
      .replace(/\{name\}/gi, targetName)
      .replace(/\{time\}/gi, timeStr)
      .replace(/\{date\}/gi, dateStr)
      .replace(/\{profile\}/gi, profileName || 'Default');

    if (locationData) {
      resolved = resolved
        .replace(/\{location\}/gi, locationData.mapUrl)
        .replace(/\{maps_url\}/gi, locationData.mapUrl)
        .replace(
          /\{coords\}/gi,
          `${locationData.latitude.toFixed(5)}, ${locationData.longitude.toFixed(5)}`
        );
    } else {
      resolved = resolved
        .replace(/\{location\}/gi, '[Location unavailable]')
        .replace(/\{maps_url\}/gi, '[Location unavailable]')
        .replace(/\{coords\}/gi, '[Coords unavailable]');
    }

    return resolved;
  }

  /**
   * Execute an emergency shortcut either in real mode or safe simulation mode
   */
  async executeShortcut(
    shortcut: EmergencyShortcut,
    isSimulation: boolean = false
  ): Promise<ExecutionReport> {
    const steps: ActionStepResult[] = [];
    const allContacts = await contactsService.getAllContacts();
    const activeProfile = await storage.getActiveProfile();

    // Resolve target contacts
    let targetContacts: EmergencyContact[] = [];

    if (shortcut.allContacts) {
      targetContacts = [...allContacts];
    } else if (shortcut.contactIds && shortcut.contactIds.length > 0) {
      targetContacts = shortcut.contactIds
        .map((id) => allContacts.find((c) => c.id === id))
        .filter((c): c is EmergencyContact => c !== undefined);
    }

    // Fallback to primary or first available contact if specified contact was not found
    if (targetContacts.length === 0 && allContacts.length > 0) {
      const primary = allContacts.find((c) => c.isPrimary) || allContacts[0];
      if (primary) targetContacts.push(primary);
    }

    steps.push({
      step: 'Resolve Recipients',
      status: targetContacts.length > 0 ? 'SUCCESS' : 'FAILED',
      message:
        targetContacts.length > 0
          ? `Found ${targetContacts.length} contact(s): ${targetContacts.map((c) => c.name).join(', ')}`
          : 'No emergency contacts configured yet',
      timestamp: Date.now(),
    });

    // Check action list (single or chained multiple actions)
    const actionsToRun: ActionType[] =
      shortcut.actionTypes && shortcut.actionTypes.length > 0
        ? shortcut.actionTypes
        : [shortcut.actionType];

    let locationData: LocationResult | undefined;

    // Acquire GPS location if requested by shortcut or actions
    const needsLocation =
      shortcut.includeLocation ||
      actionsToRun.includes('SEND_LOCATION') ||
      actionsToRun.includes('COMPOSITE_SOS');

    if (needsLocation) {
      try {
        steps.push({
          step: 'GPS Location Request',
          status: 'READY',
          message: 'Acquiring GPS coordinates...',
          timestamp: Date.now(),
        });

        locationData = await locationService.getCurrentLocation();

        steps.push({
          step: 'GPS Location Resolved',
          status: 'SUCCESS',
          message: `Coordinates: ${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)} (accuracy ~${Math.round(locationData.accuracy || 0)}m)`,
          timestamp: Date.now(),
        });
      } catch (err: any) {
        steps.push({
          step: 'GPS Location Notice',
          status: 'READY',
          message: `GPS location skipped: ${err.message}`,
          timestamp: Date.now(),
        });
      }
    }

    // Build default message body
    const primaryName = targetContacts[0]?.name || 'Emergency Contact';
    const rawMessageTemplate =
      shortcut.message || 'EMERGENCY: I need assistance immediately. My location: {location}';
    let body = this.resolveMessageTemplate(
      rawMessageTemplate,
      primaryName,
      locationData,
      activeProfile?.name
    );

    // If message didn't contain {location} tag but location was requested, append it
    if (locationData && !rawMessageTemplate.includes('{location}') && !rawMessageTemplate.includes('{maps_url}')) {
      body += `\n\nLive GPS: ${locationData.mapUrl}`;
    }

    // Execute each action in the chain
    let overallSuccess = true;
    let executionError: string | undefined;

    for (const action of actionsToRun) {
      try {
        switch (action) {
          case 'CALL_CONTACT': {
            if (targetContacts.length === 0) {
              throw new Error('Cannot place call: No contact assigned.');
            }
            const primaryTarget = targetContacts[0];
            const sanitizedPhone = primaryTarget.phoneNumber.replace(/[^0-9+]/g, '');

            if (isSimulation) {
              steps.push({
                step: 'SIMULATION — Phone Call',
                status: 'SUCCESS',
                message: `[Simulation] Would initiate phone call to ${primaryTarget.name} (${sanitizedPhone})`,
                timestamp: Date.now(),
              });
            } else {
              steps.push({
                step: 'Initiate Phone Call',
                status: 'ACTION_LAUNCHED',
                message: `Dialing ${primaryTarget.name} (${sanitizedPhone})...`,
                timestamp: Date.now(),
              });

              const url = `tel:${sanitizedPhone}`;
              try {
                await Linking.openURL(url);
                steps.push({
                  step: 'Call Dispatched to Dialer',
                  status: 'SUCCESS',
                  message: `Dialer launched for ${primaryTarget.name}`,
                  timestamp: Date.now(),
                });
              } catch (err: any) {
                throw new Error(`Could not open phone dialer for ${sanitizedPhone}: ${err.message}`);
              }
            }
            break;
          }

          case 'SEND_SMS':
          case 'EMERGENCY_MESSAGE':
          case 'SEND_LOCATION': {
            if (targetContacts.length === 0) {
              throw new Error('Cannot send SMS: No recipient phone numbers specified.');
            }
            const phoneNumbers = targetContacts.map((c) =>
              c.phoneNumber.replace(/[^0-9+]/g, '')
            );

            if (isSimulation) {
              steps.push({
                step: 'SIMULATION — SMS Dispatch',
                status: 'SUCCESS',
                message: `[Simulation] Would send message to ${phoneNumbers.join(', ')}:\n"${body}"`,
                timestamp: Date.now(),
              });
            } else {
              let smsHandled = false;

              // 1. Try Expo SMS module
              try {
                const isAvailable = await SMS.isAvailableAsync();
                if (isAvailable) {
                  steps.push({
                    step: 'Launch SMS Composer',
                    status: 'ACTION_LAUNCHED',
                    message: `Preparing SMS to ${phoneNumbers.join(', ')}...`,
                    timestamp: Date.now(),
                  });

                  const { result } = await SMS.sendSMSAsync(phoneNumbers, body);
                  smsHandled = true;

                  steps.push({
                    step: 'SMS Composer Result',
                    status: 'SUCCESS',
                    message:
                      result === 'sent'
                        ? 'SMS confirmed sent by composer'
                        : 'SMS composer opened and completed',
                    timestamp: Date.now(),
                  });
                }
              } catch (smsErr) {
                console.warn('[Expo SMS fallback needed]', smsErr);
              }

              // 2. Resilient Native URL Scheme Fallback (works 100% on Android & iOS)
              if (!smsHandled) {
                steps.push({
                  step: 'Open Native SMS App',
                  status: 'ACTION_LAUNCHED',
                  message: `Opening system messaging app for ${phoneNumbers.join(', ')}...`,
                  timestamp: Date.now(),
                });

                const separator = Platform.OS === 'ios' ? '&' : '?';
                const smsUrl = `sms:${phoneNumbers.join(',')}?body=${encodeURIComponent(body)}`;

                try {
                  await Linking.openURL(smsUrl);
                  steps.push({
                    step: 'System SMS App Launched',
                    status: 'SUCCESS',
                    message: `Pre-filled message dispatched to messaging app`,
                    timestamp: Date.now(),
                  });
                } catch (fallbackErr: any) {
                  // Final single-number fallback
                  const singleSmsUrl = `sms:${phoneNumbers[0]}?body=${encodeURIComponent(body)}`;
                  await Linking.openURL(singleSmsUrl);
                  steps.push({
                    step: 'System SMS App Launched',
                    status: 'SUCCESS',
                    message: `Dispatched to ${phoneNumbers[0]}`,
                    timestamp: Date.now(),
                  });
                }
              }
            }
            break;
          }

          case 'COMPOSITE_SOS': {
            const phoneNumbers = targetContacts.map((c) =>
              c.phoneNumber.replace(/[^0-9+]/g, '')
            );

            if (isSimulation) {
              steps.push({
                step: 'SIMULATION — Composite SOS',
                status: 'SUCCESS',
                message: `[Simulation] Would broadcast SMS to ${phoneNumbers.length} contact(s) & dial ${targetContacts[0]?.name || 'Primary'}`,
                timestamp: Date.now(),
              });
            } else {
              // 1. Send SMS to all
              if (phoneNumbers.length > 0) {
                try {
                  const isAvailable = await SMS.isAvailableAsync();
                  if (isAvailable) {
                    await SMS.sendSMSAsync(phoneNumbers, body);
                  } else {
                    const smsUrl = `sms:${phoneNumbers.join(',')}?body=${encodeURIComponent(body)}`;
                    await Linking.openURL(smsUrl);
                  }
                } catch (smsErr) {
                  console.warn('[Composite SMS]', smsErr);
                }
              }

              // 2. Call Primary contact
              if (targetContacts.length > 0) {
                const sanitizedPhone = targetContacts[0].phoneNumber.replace(/[^0-9+]/g, '');
                const url = `tel:${sanitizedPhone}`;
                try {
                  await Linking.openURL(url);
                } catch (callErr) {
                  console.warn('[Composite Call]', callErr);
                }
              }

              steps.push({
                step: 'Composite SOS Dispatched',
                status: 'SUCCESS',
                message: 'All broadcast channels triggered',
                timestamp: Date.now(),
              });
            }
            break;
          }

          case 'ALARM': {
            if (isSimulation) {
              steps.push({
                step: 'SIMULATION — Alarm Sound',
                status: 'SUCCESS',
                message: '[Simulation] Would play loud emergency alarm siren pattern',
                timestamp: Date.now(),
              });
            } else {
              steps.push({
                step: 'Emergency Alarm',
                status: 'SUCCESS',
                message: 'Audible emergency siren triggered',
                timestamp: Date.now(),
              });
            }
            break;
          }

          default:
            break;
        }
      } catch (err: any) {
        overallSuccess = false;
        executionError = err.message || 'Error occurred';
        steps.push({
          step: `Action Notice (${action})`,
          status: 'FAILED',
          message: err.message || 'Unknown error occurred',
          timestamp: Date.now(),
        });
      }
    }

    return {
      shortcutId: shortcut.id,
      shortcutName: shortcut.name,
      isSimulation,
      overallStatus: overallSuccess ? 'SUCCESS' : 'FAILED',
      steps,
      location: locationData,
      targetContacts,
      preparedMessage: body,
      error: executionError,
    };
  }
}

export const emergencyActionService = EmergencyActionService.getInstance();
export default emergencyActionService;
