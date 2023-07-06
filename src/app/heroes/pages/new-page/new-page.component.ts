import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Hero, Publisher } from '../../interfaces/heores.interface';
import { HeroesService } from '../../services/heroes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, switchMap, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: [
  ]
})
export class NewPageComponent implements OnInit{

  public heroForm = new FormGroup({

    id:        new FormControl(''),
    superhero: new FormControl('', {nonNullable: true}),
    publisher: new FormControl<Publisher>(Publisher.DCComics),
    alter_ego: new FormControl(''),
    first_appearance:  new FormControl(''),
    characters: new FormControl(''),
    alt_img:    new FormControl('')
  });



  public publishers = [
    {id: 'DC Comics', value: 'DC - Comics'},
    {id: 'Marvel Comics', value: 'Marvel - Comics'},
  ];

  constructor(private herosService: HeroesService, private ActivatedRoute: ActivatedRoute,
    private router: Router, private snackbar: MatSnackBar, private dialog: MatDialog){}

  get currentHero():Hero{
    const hero =this.heroForm.value as Hero;
    return hero;
  }

  ngOnInit(): void {

    if(!this.router.url.includes('edit')) return;

    this.ActivatedRoute.params
      .pipe(
        switchMap(({id}) => this.herosService.getHeroById(id)),
      ).subscribe(hero => {
        if(!hero) return this.router.navigateByUrl('/');

        this.heroForm.reset(hero);
        return;
      });

  }

  onSubmit():void{
    if (this.heroForm.invalid) return;

    if (this.currentHero.id){
      this.herosService.updateHero(this.currentHero)
        .subscribe(hero =>{
          this.showSnackBar(`${hero.superhero} modificado!`);
        });
      return;
    }

    this.herosService.addHero(this.currentHero)
      .subscribe(hero =>{
        this.router.navigate(['/heroes/edit', hero.id]);
        this.showSnackBar(`${hero.superhero} agregado!`);
      });

    //this.herosService.updateHero();
  }

  onDeleteHero(){
    if (!this.currentHero.id) throw Error('El id del heroe es requerido.');
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: this.heroForm.value
    });

    dialogRef.afterClosed()
    .pipe(
      filter((result: boolean) => result),
      switchMap( () => this.herosService.deleteHeroById(this.currentHero.id)),
      filter((wasDeleted: boolean) => wasDeleted)
    )
    .subscribe(() => {
      this.router.navigate(['/heroes']);
    });
  }

  showSnackBar(message: string): void{
    this.snackbar.open(message, 'done', {
      duration:2500,

    });
  }

}
