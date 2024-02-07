import { Component, OnInit, Input } from '@angular/core';
import { WishlistedService } from '../../../../service/wishlisted.service';

@Component({
  selector: 'app-snack-bar',
  templateUrl: './snack-bar.component.html',
  styleUrls: ['./snack-bar.component.scss']
})
export class SnackBarComponent implements OnInit {

  data: any;
  
  constructor(private wishlistedService: WishlistedService) { }

  ngOnInit(): void {
    this.wishlistedService.data$.subscribe((data) => {
      this.data = data;
    });
  }

}
