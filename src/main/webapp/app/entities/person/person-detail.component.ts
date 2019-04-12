import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { filter, map } from 'rxjs/operators';

import { JhiAlertService } from 'ng-jhipster';
import { IPerson } from 'app/shared/model/person.model';
import { IAddress } from 'app/shared/model/address.model';
import { IPersonContact } from 'app/shared/model/person-contact.model';
import { AddressService } from '../address/address.service';
import { PersonContactService } from '../person-contact/person-contact.service';
@Component({
    selector: 'jhi-person-detail',
    templateUrl: './person-detail.component.html'
})
export class PersonDetailComponent implements OnInit {
    person: IPerson;
    addresses: IAddress[];
    contacts: IPersonContact[];

    constructor(
        protected activatedRoute: ActivatedRoute,
        protected addressService: AddressService,
        protected personContactService: PersonContactService,
        protected jhiAlertService: JhiAlertService
    ) {
        this.addresses = [];
    }

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ person }) => {
            this.person = person;
        });

        this.loadAddresses();
        this.loadConcats();
    }

    loadAddresses() {
        this.addressService
            .query()
            .pipe(
                filter((mayBeOk: HttpResponse<IAddress[]>) => mayBeOk.ok),
                map((response: HttpResponse<IAddress[]>) => response.body)
            )
            .subscribe(
                (res: IAddress[]) => (this.addresses = this.filterByPersonId(res)),
                (res: HttpErrorResponse) => this.onError(res.message)
            );
    }

    loadConcats() {
        this.personContactService
            .query()
            .pipe(
                filter((mayBeOk: HttpResponse<IPersonContact[]>) => mayBeOk.ok),
                map((response: HttpResponse<IPersonContact[]>) => response.body)
            )
            .subscribe(
                (res: IPersonContact[]) => (this.contacts = this.filterByPersonId(res)),
                (res: HttpErrorResponse) => this.onError(res.message)
            );
    }

    filterByPersonId(res: any) {
        return res.filter(val => val.personId === this.person.id);
    }

    previousState() {
        window.history.back();
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }
}
