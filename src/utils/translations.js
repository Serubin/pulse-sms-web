import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

export const i18n = new VueI18n({
    locale: navigator.language.slice(0,2),
    fallbackLocale: 'en',
    messages: {
        en: {
            login: {
                first: 'First, <a href="https://messenger.klinkerapps.com/overview/signup.html" target="_blank">sign up</a> for an account from the <b>Text from any device</b> option in the navigation drawer of the phone app.',
                error: 'Email or Password incorrect',
                email: 'Email Address',
                password: 'Password',
                forgotpassword: 'Forgot your password?',
                iphone: 'Have an <i>iPhone</i>?',
                login: 'Log in',
            },
            sidebar: {
                conversations: 'Conversations',
                unreadconversations: 'Unread Conversations',
                privateconversations: 'Private Conversations',
                archive: 'Archive',
                folders: 'Folders',
                scheduled: 'Scheduled Messages',
                blacklist: 'Blacklist',
                searchconversations: 'Search Conversations'
            },
            api: {
                disconnected: 'You\'ve been disconnected. We\'re trying to reconnect you...',
                back: 'And we\'re back !'
            },
            conversations: {
                pinned: 'Pinned',
                today: 'Today',
                yesterday: 'Yesterday',
                thisweek: 'This Week',
                thismonth: 'This Month',
                older: 'Older',
                noconv: 'No Conversations',
                deleteconfirm: 'Are you sure you want to delete these conversations?'
            },
            passcode: {
                enter: 'Enter Passcode',
                passcode: 'Passcode'
            },
            dialog: {
                continue: 'Continue',
                cancel: 'Cancel',
                save: 'Save',
                close: 'Close',
                create: 'Create',
                delete: 'Delete'
            },
            sendbar: {
                type: 'Type message...'
            },
            thread: {
                settings: {
                    updatecolors: 'Update Theme Colors',
                    pin: 'Pin Conversation',
                    mute: 'Mute Conversation',
                    private: 'Private Conversation',
                    conversationtitle: 'Conversation Title',
                    updatetitle: 'Update Conversation Title'
                },
                delete: {
                    delete: 'Delete',
                    cancel: 'Cancel',
                    thread: 'Are you sure that you want to delete this conversation?',
                    message: 'Are you sure that you want to delete this message?'
                },
                blacklisted: 'Contact blacklisted and moved to the archive.',
                groupblacklisted: 'Cannot blacklist group conversations.',
                newmessage: 'New Message',
                show: 'Show'
            },
            menus: {
                account: 'My Account',
                settings: 'Settings',
                help: 'Help and Feedback',
                logout: 'Logout',
                convinfo: 'Conversation Information',
                blacklist: 'Blacklist Contact',
                delete: 'Delete Conversation',
                archive: 'Archive Conversation',
                unarchive: 'Move to Inbox',
                deleteselected: 'Delete Conversations',
                archiveselected: 'Archive Conversations',
                unarchiveselected: 'Move Conversations to Inbox',
                selectall: 'Select All Conversations',
                convsettings: 'Conversation Settings'
            },
            compose: {
                norecipient: 'No Recipient',
                type: 'Search contacts or enter phone numbers (separated by a semicolon)...',
                cantfind: 'Can\'t find your contact?',
                alreadyadded: '{name} has already been added',
                downloading: 'Downloading contacts...'
            },
            contact: {
                group: 'Group',
                mobile: 'Mobile',
                home: 'Home',
                work: 'Work',
                other: 'Other'
            },
            blacklist: {
                none: 'No Blacklisted Numbers',
                phone: 'Phone Number',
                create_phone: 'Blacklist by Phone',
                create_phrase: 'Blacklist by Phrase',
                phrase: 'Phrase',
                delete: 'Remove blacklist'
            },
            scheduled: {
                repeat: {
                    never: 'Do not repeat',
                    daily: 'Repeat daily',
                    weekly: 'Repeat weekly',
                    monthly: 'Repeat monthly',
                    yearly: 'Repeat yearly'
                },
                media: 'Media, within a scheduled message, can only be viewed on the phone app.'
            },
            settings: {
                theme: 'Theme Settings',
                refresh: 'Refresh settings from phone',
                explanatory_intro: 'These settings are pulled from the app, when you click this preference. You can also change them manually, from this page.',
                base: 'Base Theme',
                daynight: 'Day / Night',
                light: 'Light',
                dark: 'Dark',
                black: 'Black',
                primary: 'Primary Color',
                darkprimary: 'Primary Color Dark',
                accent: 'Accent Color',
                applyeverywhere: 'Apply Colors to all Conversations',
                applyprimary: 'Apply Primary Color to App Bar',
                messagetimestamp: 'Display Timestamp on Every Message',
                conversationcategories: 'Display Conversations in Date Categories',
                webspecific: 'Web Specific Settings',
                shownotifs: 'Show Notifications',
                entersend: 'Use Enter to Send Messages',
                yes: 'Yes',
                no: 'No'
            },
            account: {
                upgrade_subscription: 'Want to change or upgrade your subscription? Head to the "My Account" section, in the Android app!'
            },
            experiments: {
                disclaimer: 'Disclaimer',
                explanatory_intro: 'These preferences come with no support and no guarentee that they will continue to exist. As an open source app, they will be useful to test new features and provide developers with the means of implementing their own tweaks into the app. Use with caution and do not rely on them, unless you are maintaining them. They are meant to be experiments.',
                larger_app_bar: 'Display Larger App Bar',
                unread_count_in_sidebar: 'Display Unread Messages Count in Sidebar',
            }
        },
        fr: {
            login: {
                first: 'D\'abord, <a href="https://messenger.klinkerapps.com/overview/signup.html" target="_blank">enregistrez-vous</a> avec le bouton <b>SMS depuis d\'autres appareils</b> dans le menu de navigation de l\'application mobile.',
                error: 'Email ou Mot de passe incorrect',
                email: 'Adresse email',
                password: 'Mot de passe',
                forgotpassword: 'Mot de passe oublié ?',
                iphone: 'Vous avez un <i>iPhone</i>?',
                login: 'Connexion',
            },
            sidebar: {
                conversations: 'Conversations',
                privateconversations: 'Conversations privées',
                archive: 'Conversations archivées',
                folders: 'Dossiers',
                scheduled: 'Messages programmés',
                blacklist: 'Liste noire'
            },
            api: {
                disconnected: 'Vous avez été déconnecté. Nous tentons de vous reconnecter...',
                back: 'Connexion établie !'
            },
            conversations: {
                pinned: 'Épinglés',
                today: 'Aujourd\'hui',
                yesterday: 'Hier',
                thisweek: 'Cette semaine',
                thismonth: 'Ce mois ci',
                older: 'Anciens',
                noconv: 'Aucune conversation'
            },
            passcode: {
                enter: 'Entrez le code secret',
                passcode: 'Code secret'
            },
            dialog: {
                continue: 'Continuer',
                cancel: 'Abandonner',
                save: 'Sauvegarder',
                close: 'Fermer',
                create: 'Créer',
                delete: 'Supprimer'
            },
            sendbar: {
                type: 'Composez votre message'
            },
            thread: {
                settings: {
                    updatecolors: 'Changer les couleurs',
                    pin: 'Épingler la conversation',
                    mute: 'Rendre muet',
                    private: 'Conversation privée'
                }
            },
            menus: {
                account: 'Mon compte',
                settings: 'Paramètres',
                help: 'Aide et retours',
                logout: 'Déconnexion',
                convinfo: 'Informations',
                blacklist: 'Bloquer',
                delete: 'Supprimer',
                archive: 'Archiver',
                unarchive: 'Désarchiver',
                convsettings: 'Paramètres'
            },
            compose: {
                norecipient: 'Pas de destinataire',
                type: 'Entrez le nom d\'un contact',
                cantfind: 'Contact introuvable ?',
                alreadyadded: '{name} est déjà destinataire'
            },
            blacklist: {
                none: 'Liste noire vide',
                phone: 'Numéro de téléphone',
                create: 'Ajouter un blocage'
            },
            settings: {
                theme: 'Paramètre d\'apparence',
                refresh: 'Récupérer les paramètres du téléphone',
                explanatory_intro: 'Ces paramètres sont récupérés depuis l\'application, lorsque vous cliquez dessus. Vous pouvez aussi les changer manuellement depuis cette page.',
                base: 'Thème de base',
                daynight: 'Jour / Nuit',
                light: 'Clair',
                dark: 'Sombre',
                black: 'Noir',
                primary: 'Couleur primaire',
                darkprimary: 'Couleur primaire foncée',
                accent: 'Couleur secondaire',
                applyeverywhere: 'Appliquer ces couleurs pour toutes les conversations',
                applyprimary: 'Appliquer la couleur primaire à la barre de navigation',
                webspecific: 'Paramètres spécifiques au web',
                shownotifs: 'Afficher les notifications',
                entersend: 'La touche entrée envoie le message',
                yes: 'Oui',
                no: 'Non'
            }
        },
        sv: {
            login: {
                first: '<a href="https://messenger.klinkerapps.com/overview/signup.html" target="_blank">Skapa</a> först ett konto genom att klicka på <b>Skriv från valfri enhet</b> i menyn i telefonens app.',
                error: 'Fel e-post eller lösenord',
                email: 'Epostadress',
                password: 'Lösenord',
                forgotpassword: 'Glömt ditt lösenord?',
                iphone: 'Har du en <i>iPhone</i>?',
                login: 'Logga in',
            },
            sidebar: {
                conversations: 'Konversationer',
                unreadconversations: 'Olästa konversationer',
                privateconversations: 'Privata konversationer',
                archive: 'Arkiv',
                folders: 'Mappar',
                scheduled: 'Schemalagda meddelanden',
                blacklist: 'Svartlistade',
                searchconversations: 'Sök konversationer'
            },
            api: {
                disconnected: 'Du har blivit frånkopplad. Försöker koppla upp igen...',
                back: 'Återuppkopplad!'
            },
            conversations: {
                pinned: 'Pinnad',
                today: 'Idag',
                yesterday: 'Igår',
                thisweek: 'Denna vecka',
                thismonth: 'Denna månad',
                older: 'Äldre',
                noconv: 'Inga konversationer',
                deleteconfirm: 'Är du säker på att du vill radera dessa konversationer?'
            },
            passcode: {
                enter: 'Skriv in lösenord',
                passcode: 'Lösenord'
            },
            dialog: {
                continue: 'Fortsätt',
                cancel: 'Avbryt',
                save: 'Spara',
                close: 'Stäng',
                create: 'Skapa',
                delete: 'Radera'
            },
            sendbar: {
                type: 'Skriv meddelande...'
            },
            thread: {
                settings: {
                    updatecolors: 'Ändra temafärger',
                    pin: 'Pinna konversationer',
                    mute: 'Tysta konversationer',
                    private: 'Privata konversationer'
                },
                delete: {
                    delete: 'Radera',
                    cancel: 'Avbryt',
                    thread: 'Är du säker på att du vill radera denna konversation?',
                    message: 'Är du säker på att du vill radera detta meddelande?'
                },
                blacklisted: 'Kontakten svartlistad och flyttad till arkivet.',
                groupblacklisted: 'Kan inte svartlista gruppkonversationer.',
                newmessage: 'Nytt meddelande',
                show: 'Visa'
            },
            menus: {
                account: 'Mitt konto',
                settings: 'Inställningar',
                help: 'Hjälp och feedback',
                logout: 'Logga ut',
                convinfo: 'Konversationsinformation',
                blacklist: 'Svarlista kontakt',
                delete: 'Radera konversation',
                archive: 'Arkivera konversation',
                unarchive: 'Flytta till Inkorgen',
                deleteselected: 'Radera konversation',
                archiveselected: 'Arkivera konversation',
                unarchiveselected: 'Flytta konversation till Inkorgen',
                selectall: 'Markera alla konversationer',
                convsettings: 'Konversationsinställningar'
            },
            compose: {
                norecipient: 'Ingen mottagare',
                type: 'Sök kontakter eller skriv ett eller flera telefonnummer (separerade med semikolon)...',
                cantfind: 'Kan inte hitta kontakt?',
                alreadyadded: '{name} har redan lagts till',
                downloading: 'Laddar ner kontakter...'
            },
            contact: {
                group: 'Grupp',
                mobile: 'Mobil',
                home: 'Hem',
                work: 'Arbete',
                other: 'Annan'
            },
            blacklist: {
                none: 'Inga svartlistade nummer',
                phone: 'Telefonnummer',
                create_phone: 'Svarlista telefonnummer',
                create_phrase: 'Svartlista en fras',
                phrase: 'Fras',
                delete: 'Radera svartlista'
            },
            scheduled: {
                repeat: {
                    never: 'Upprepa ej',
                    daily: 'Upprepa dagligen',
                    weekly: 'Upprepa varje vecka',
                    monthly: 'Upprepa varje månad',
                    yearly: 'Upprepa varje år'
                },
                media: 'Media i ett schemalagt meddelande kan bara ses genom telefonappen.'
            },
            settings: {
                theme: 'Temainställningar',
                refresh: 'Uppdatera inställningar från telefon',
                explanatory_intro: 'Dessa inställningar hämtas från telefonappen när du väljer detta alternativ. Du kan också ändra dem manuellt på den här sidan.',
                base: 'Grundtema',
                daynight: 'Dag / Natt',
                light: 'Ljust',
                dark: 'Mörkt',
                black: 'Svart',
                primary: 'Primär färg',
                darkprimary: 'Primär mörk färg',
                accent: 'Accentfärg',
                applyeverywhere: 'Applicera färger på alla konversationer',
                applyprimary: 'Applicera primär färg på "App Bar"',
                messagetimestamp: 'Visa tidsstämpel på varje meddelande',
                conversationcategories: 'Visa konversationer i datumkategorier',
                webspecific: 'Webspecifika inställningar',
                shownotifs: 'Visa notiser',
                entersend: 'Använd Enter-knappen för att skicka meddelanden',
                yes: 'Ja',
                no: 'Nej'
            },
            account: {
                upgrade_subscription: 'Vill du ändra eller uppgradera ditt abonnemang? Gå till "Mitt konto" i Android appen!'
            },
            experiments: {
                disclaimer: 'Varning',
                explanatory_intro: 'Dessa inställningar ges ingen support eller garantier att de kommer fortsätta finnas kvar. Som en app med öppen källkod är de användbara för att testa nya funktioner och förse utvecklare med verktyg för att applicera sina egna justeringar i appen. Använd försiktigt och förlita dig inte på dem om du inte underhåller dem själv. De är avsedda som experiment.',
                larger_app_bar: 'Visa större "App Bar"',
                unread_count_in_sidebar: 'Visa antal Olästa meddelanden i sidomenyn',
            }
        }
    }});
