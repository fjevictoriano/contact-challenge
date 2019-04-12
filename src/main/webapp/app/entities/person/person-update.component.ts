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
import { AddressService } from '../address/address.service';
import { PersonContactService } from '../person-contact/person-contact.service';

@Component({
    selector: 'jhi-person-update',
    templateUrl: './person-update.component.html'
})
export class PersonUpdateComponent implements OnInit {
    myForm: FormGroup;
    person: IPerson;
    isSaving: boolean;
    users: IUser[];
    showID: boolean;
    data = {
        person: {},
        contacts: [],
        addresses: []
    };

    constructor(
        private fb: FormBuilder,
        protected jhiAlertService: JhiAlertService,
        protected personService: PersonService,
        protected addressService: AddressService,
        protected personContactService: PersonContactService,
        protected userService: UserService,
        protected activatedRoute: ActivatedRoute
    ) {
        this.showID = true;
        this.person = new Person();
        this.person.personContacts = [{}];

        this.myForm = this.fb.group({
            person: this.fb.group(this.person),
            contacts: this.fb.array([]),
            addresses: this.fb.array([])
        });
    }
    ngOnInit() {
        this.isSaving = false;
        this.activatedRoute.data.subscribe(({ person }) => {
            if (person.id !== undefined) {
                this.showID = false;
                this.loadPerson(person);
                this.loadConcats();
                this.loadAddresses();
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
    loadPerson(person: IPerson) {
        const control = <FormGroup>this.myForm.controls.person;
        control.patchValue(person);
    }

    loadConcats() {
        this.personContactService
            .query()
            .pipe(
                filter((mayBeOk: HttpResponse<IPersonContact[]>) => mayBeOk.ok),
                map((response: HttpResponse<IPersonContact[]>) => response.body)
            )
            .subscribe((res: IPersonContact[]) => this.setContacts(res), (res: HttpErrorResponse) => this.onError(res.message));
    }

    setContacts(res: IPersonContact[]) {
        const personID = this.myForm.value.person.id;
        const control = <FormArray>this.myForm.controls.contacts;
        res.filter(val => val.personId === personID).forEach(contact => {
            control.push(this.fb.group(contact));
        });
    }

    loadAddresses() {
        this.addressService
            .query()
            .pipe(
                filter((mayBeOk: HttpResponse<IAddress[]>) => mayBeOk.ok),
                map((response: HttpResponse<IAddress[]>) => response.body)
            )
            .subscribe((res: IAddress[]) => this.setAddresses(res), (res: HttpErrorResponse) => this.onError(res.message));
    }

    setAddresses(res: IAddress[]) {
        const personID = this.myForm.value.person.id;
        const control = <FormArray>this.myForm.controls.addresses;
        res.filter(val => val.personId === personID).forEach(address => {
            control.push(this.fb.group(address));
        });
    }

    addNewContact() {
        const personContact: IPersonContact = new PersonContact();
        personContact.personId = this.myForm.value.person.id;
        const control = <FormArray>this.myForm.controls.contacts;
        control.push(this.fb.group(personContact));
    }

    addNewAddress() {
        const address: IAddress = new Address();
        address.personId = this.myForm.value.person.id;
        const control = <FormArray>this.myForm.controls.addresses;
        control.push(this.fb.group(address));
    }

    save(f) {
        const person = <IPerson>this.myForm.value.person;
        person.addresses = <IAddress[]>this.myForm.value.addresses;
        person.personContacts = <IPersonContact[]>this.myForm.value.contacts;
        console.log(JSON.stringify(person));
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
