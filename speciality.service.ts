import { Injectable } from '@angular/core';
import {CatalogService} from './catalog.service';
import {HttpService} from './http.service';
import {Department} from '../Models/Domain/Department';
import {Specialty} from '../Models/Domain/Specialty';
import {Profile} from '../Models/Domain/Profile';
import {map} from 'rxjs/operators';
import {Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class SpecialtyService {

  private Departments: Department[];    // Список подразделений  и напрвлений по каждому из них
  private combinations: string [] =[];  // Признаки, что грузили, что нет

  constructor(private http: HttpService, private catalog: CatalogService)
  {
    // 1. Загрузка подразделений
    this.catalog.getDepartments().subscribe(data=> {
      this.Departments = data;
   });

  }

  /**
   * Получение списка направлений по параметам из стора
   * @constructor
   * @param {number} DepartmentID - Код подразделения
   * @param {number} LevelID - Код уровеня образования
   * @param {number} FormID - Код формы обучения
   */
  getSpecialties(DepartmentID, LevelID, FormID): Observable<Specialty[]> {

    // Находим нужное подразделение
    let item = this.Departments.find(s => s.DepartmentID == DepartmentID);

    // Если еще нет направлений
    if (!item.Specialties) {
      item.Specialties = [];
    }

    // Проверка, не искали ли уже по таким параметрам в базе
    if (this.combinations.includes(`${DepartmentID}_${LevelID}_${FormID}`)) {
      // если данные есть, возвращаем сразу
      return of(item.Specialties.filter(s => s.LevelID == LevelID && s.FormID == FormID));
    } else {
      //если  данных нет, то грузим
      return this.loadSpecialties(item, LevelID, FormID);
    }

  }


  /**
   * Загрузка направлений с сервера.
   * @constructor
   * @param {Department} Department - Подразделение, для которого грузим направления
   * @param {number} LevelID - Код уровеня образования
   * @param {number} FormID - Код формы обучения
   */
  private loadSpecialties(Department: Department, LevelID, FormID)
  {
    return this.http.Send<Specialty[]>('GET', `specialties/enroll/2020/${Department.DepartmentID}?levelID=${LevelID}&FormID=${FormID}`)
      .pipe(map(data=>{
        Department.Specialties.push(...data);
        this.combinations.push(`${Department.DepartmentID}_${LevelID}_${FormID}`)
        return data;
      }));
  }


   /**
   * Загрузка профилей с сервера по коду специальности.
   * @constructor
   * @param {number} SpecialtyID - Код специальности
   */
    getProfile(SpecialtyID) : Observable<Profile[]>
    {
      return this.http.Send<Profile[]>('GET', `specialties/profiles/${SpecialtyID}`)
    }


}
