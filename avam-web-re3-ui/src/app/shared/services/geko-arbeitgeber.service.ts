import { Injectable } from '@angular/core';
import { FacadeService } from '@shared/services/facade.service';
import { GekoArbeitgeberRestService } from '@core/http/geko-arbeitgeber-rest.service';
import { SearchSessionStorageService } from '@shared/services/search-session-storage.service';
import { GekoVerlaufCallbackResolverService } from '@shared/services/geko-verlauf-callback-resolver.service';
import { RedirectService } from '@shared/services/redirect.service';
import { CallbackHelperService } from '@shared/services/callback-helper.service';
import { UnternehmenRestService } from '@core/http/unternehmen-rest.service';

@Injectable()
export class GekoArbeitgeberService {
    constructor(
        public facade: FacadeService,
        public rest: GekoArbeitgeberRestService,
        public storage: SearchSessionStorageService,
        public callbackResolver: GekoVerlaufCallbackResolverService,
        public callbackHelper: CallbackHelperService,
        public redirect: RedirectService,
        public unternehmenRestService: UnternehmenRestService
    ) {}
}
