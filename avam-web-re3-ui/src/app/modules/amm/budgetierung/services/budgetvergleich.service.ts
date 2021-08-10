import { Injectable } from '@angular/core';
import { ListeKopieParamDTO } from '@app/shared/models/dtos-generated/listeKopieParamDTO';

@Injectable()
export class BudgetvergleichService {
    private listeKopieParam: ListeKopieParamDTO;

    setListeKopieParam(param: ListeKopieParamDTO) {
        this.listeKopieParam = param;
    }

    getListeKopieParam(): ListeKopieParamDTO {
        return this.listeKopieParam;
    }
}
