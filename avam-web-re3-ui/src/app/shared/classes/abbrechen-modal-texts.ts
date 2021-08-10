import { AbbrechenModalText } from '../components/abbrechen-modal/abbrechen-modal.component';
export enum AbbrechenText {
    Default,
    Zuruecksetzen
}
export class AbbrechenModalTexte {
    static getText(textType: AbbrechenText): AbbrechenModalText {
        switch (textType) {
            case AbbrechenText.Default: {
                return {
                    modalHeader: 'common.message.ungespeicherteAnderungen',
                    bodyHeader: 'common.message.achtung',
                    bodyMessage: 'common.message.alertnotsaved2',
                    cancelButtonText: 'common.message.aufSeiteBleiben',
                    okButtonText: 'common.message.seiteVerlassen'
                };
            }
            case AbbrechenText.Zuruecksetzen: {
                return {
                    modalHeader: 'common.message.aenderungenZuruecksetzen',
                    bodyHeader: 'common.message.achtung',
                    bodyMessage: 'common.message.alertzuruecksetzen',
                    cancelButtonText: 'common.message.aufZuruecksetzenAbbrechen',
                    okButtonText: 'common.message.seiteZuruecksetzen'
                };
            }
            default: {
                return null;
            }
        }
    }
}
