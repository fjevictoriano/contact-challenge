import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import * as moment from 'moment';

import { JhiAlertService } from 'ng-jhipster';
import { IPerson } from 'app/shared/model/person.model';
import { PersonService } from './person.service';
import { IUser, UserService } from 'app/core';
import { Address, AddressType, IAddress } from 'app/shared/model/address.model';
import { IPersonContact } from 'app/shared/model/person-contact.model';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Person } from '../../shared/model/person.model';
import { PersonContact } from '../../shared/model/person-contact.model';

@Component({
    selector: 'jhi-person-update',
    templateUrl: './person-update.component.html'
})
export class PersonUpdateComponent implements OnInit {
    myForm: FormGroup;
    person: IPerson;
    isSaving: boolean;
    users: IUser[];
    data = {
        showID: true,
        person: {
            addresses: [],
            personContacts: []
        }
    };

    constructor(
        private fb: FormBuilder,
        protected jhiAlertService: JhiAlertService,
        protected personService: PersonService,
        protected userService: UserService,
        protected activatedRoute: ActivatedRoute
    ) {
        this.person = new Person();
        this.myForm = this.fb.group({
            showID: true,
            person: this.fb.group({
                ...this.person,

                addresses: this.fb.array([]),
                personContacts: this.fb.array([])
            })
        });
    }
    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ person }) => {
            if (person.id) {
                this.personService
                    .find(person.id)
                    .pipe(
                        filter((mayBeOk: HttpResponse<IPerson>) => mayBeOk.ok),
                        map((response: HttpResponse<IPerson>) => response.body)
                    )
                    .subscribe((res: IPerson) => this.setPersonForm(res), (res: HttpErrorResponse) => this.onError(res.message));
            }
        });

        this.userService
            .query()
            .pipe(
                filter((mayBeOk: HttpResponse<IUser[]>) => mayBeOk.ok),
                map((response: HttpResponse<IUser[]>) => response.body)
            )
            .subscribe((res: IUser[]) => (this.users = res), (res: HttpErrorResponse) => this.onError(res.message));
    }

    setPersonForm(person: IPerson) {
        this.myForm = this.fb.group({
            showID: false,
            person: this.fb.group({
                ...person,
                addresses: this.fb.array(this.setAddresses(person.addresses)),
                personContacts: this.fb.array(this.setPersonContacts(person.personContacts))
            })
        });
    }

    setAddresses(addresses) {
        let addressesControl = [];
        addresses.forEach(address => {
            addressesControl.push(this.fb.group(address));
        });
        return addressesControl;
    }

    setPersonContacts(contacts) {
        let contactsControls = [];
        contacts.forEach(contact => {
            contactsControls.push(this.fb.group(contact));
        });
        return contactsControls;
    }

    addNewContact() {
        const personContact: IPersonContact = new PersonContact();
        const control = <FormArray>this.myForm.controls.person.get('personContacts');
        control.push(this.fb.group(personContact));
    }

    addNewAddress() {
        const address: IAddress = new Address();
        const control = <FormArray>this.myForm.controls.person.get('addresses');
        control.push(this.fb.group(address));
    }

    save(f) {
        const person = <IPerson>this.myForm.controls.person.value;
        this.isSaving = true;
        if (person.id) {
            this.subscribeToSaveResponse(this.personService.update(person));
        } else {
            person.birthday = moment().parseZone();
            this.subscribeToSaveResponse(this.personService.create(person));
        }
    }

    previousState() {
        window.history.back();
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<IPerson>>) {
        result.subscribe((res: HttpResponse<IPerson>) => this.onSaveSuccess(), (res: HttpErrorResponse) => this.onSaveError());
    }

    protected onSaveSuccess() {
        this.isSaving = false;
        this.previousState();
    }

    protected onSaveError() {
        this.isSaving = false;
    }

    protected onError(errorMessage: string) {
        this.jhiAlertService.error(errorMessage, null, null);
    }

    trackUserById(index: number, item: IUser) {
        return item.id;
    }
}
