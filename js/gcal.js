/**
 * ECHO Google Calendar Integration Logic
 */

const GCAL_CONFIG = {
    CLIENT_ID: '431535085448-j0nr6t8fqr01n6in4jnrsltje6tvmll2.apps.googleusercontent.com',
    SCOPES: 'https://www.googleapis.com/auth/calendar.events',
    DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
};

const GCalManager = {
    tokenClient: null,
    gapiInited: false,
    gisInited: false,
    accessToken: null,

    init() {
        this.gapiLoaded();
        this.gisLoaded();
    },

    gapiLoaded() {
        gapi.load('client', async () => {
            await gapi.client.init({
                discoveryDocs: GCAL_CONFIG.DISCOVERY_DOCS,
            });
            this.gapiInited = true;
            console.log('GAPI Inited');
        });
    },

    gisLoaded() {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: GCAL_CONFIG.CLIENT_ID,
            scope: GCAL_CONFIG.SCOPES,
            callback: (resp) => {
                if (resp.error !== undefined) {
                    throw (resp);
                }
                this.accessToken = resp.access_token;
                console.log('Access token received');

                // After getting token, we can perform actions
                if (this._onAuthSuccess) {
                    this._onAuthSuccess();
                    this._onAuthSuccess = null;
                }
            },
        });
        this.gisInited = true;
        console.log('GIS Inited');
    },

    /**
     * Authenticate and bind Google Account
     */
    authenticate(callback) {
        this._onAuthSuccess = callback;
        // Request access token
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
    },

    /**
     * Create a calendar event from an ECHO task
     */
    async syncTask(task) {
        if (!this.accessToken) {
            console.warn('Sync failed: No access token');
            return false;
        }

        const event = {
            'summary': `ECHO 委託: ${task.title}`,
            'location': task.location || '',
            'description': task.desc + (task.checklist ? '\n\n冒險步驟:\n' + task.checklist.map(i => '- ' + i.text).join('\n') : ''),
            'start': {
                'dateTime': new Date(task.createdAt).toISOString(),
                'timeZone': 'Asia/Taipei'
            },
            'end': {
                'dateTime': task.deadline ? new Date(t.deadline).toISOString() : new Date(task.createdAt + 3600000).toISOString(),
                'timeZone': 'Asia/Taipei'
            }
        };

        try {
            const response = await gapi.client.calendar.events.insert({
                'calendarId': 'primary',
                'resource': event,
            });
            console.log('Event created: ' + response.result.htmlLink);
            return true;
        } catch (err) {
            console.error('Error creating event', err);
            return false;
        }
    }
};

window.onload = () => {
    // We defer init to make sure scripts are loaded
    setTimeout(() => GCalManager.init(), 100);
};
