import Vue from 'vue'
import VueI18n from 'vue-i18n'

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
                privateconversations: 'Private Conversations',
                archive: 'Archive',
                folders: 'Folders',
                scheduled: 'Scheduled Messages',
                blacklist: 'Blacklist'
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
                noconv: 'No Conversations'
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
                    primary: 'Primary Color',
                    darkprimary: 'Primary Color Dark',
                    accent: 'Accent Color',
                    updatecolors: 'Update Theme Colors',
                    pin: 'Pin Conversation',
                    mute: 'Mute Conversation',
                    private: 'Private Conversation'
                }
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
                unarchive: 'Unarchive Conversation',
                convsettings: 'Conversation Settings'
            },
            compose: {
                norecipient: 'No Recipient',
                type: 'Type contact...',
                cantfind: 'Can\'t find your contact?',
                alreadyadded: '{name} has already been added'
            },
            blacklist: {
                none: 'No Blacklisted Numbers',
                phone: 'Phone Number',
                create: 'Create Blacklist'
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
                    primary: 'Couleur primaire',
                    darkprimary: 'Couleur primaire foncée',
                    accent: 'Couleur secondaire',
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
            }

        }
    }});
