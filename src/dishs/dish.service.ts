import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import DishCategory from '../dishs/entities/dish-category.entity';
import DishSubMenuOption from './entities/dish-submenu-option.entity';
import DishSubMenu from './entities/dish-subMenu.entity';
import Dish from './entities/dish.entity';
import DishsCategorys from './entities/dishs-categorys.entity';

@Injectable()
export class DishService {
  constructor(
    @InjectRepository(Dish)
    private readonly dishs: Repository<Dish>,
    @InjectRepository(DishsCategorys)
    private readonly dishsCategorys: Repository<DishsCategorys>,
    @InjectRepository(DishCategory)
    private readonly dishCategorys: Repository<DishCategory>,
    @InjectRepository(DishSubMenuOption)
    private readonly dishSubMenuOptions: Repository<DishSubMenuOption>,
    @InjectRepository(DishSubMenu)
    private readonly dishSubMneus: Repository<DishSubMenu>,
  ) {}
}
