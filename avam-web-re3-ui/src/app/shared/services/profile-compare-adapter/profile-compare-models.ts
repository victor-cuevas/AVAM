export class ProfileCompareRow {
    isMismatch: number;
    attribute: string;
    osteValue: string;
    stesValue: string;
    isParent: boolean;
}

export interface ProfileCompareAdapterState {
    //BERUF
    stesHatBerufNichtErfuellt: boolean;
    berufeStimmemUeberein: boolean;
    stesHatAusbildungsniveauNichtErfuellt: boolean;
    meldungStesHatNichtErfuelltAnzeigen: boolean;
    attributeVonBerufNichtVergleiche: boolean;
    stesHatQualifikationNichtErfuellt: boolean;
    stesHatErfahrungNichtErfuellt: boolean;
    //SPRACHE
    stesHatSpracheNichtErfuellt: boolean;
    stesHatMuendlicheKenntnisseNichtErfuellt: boolean;
    stesHatSchriftlicheKenntnisseNichtErfuellt: boolean;
}
