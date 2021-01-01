import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as DataLoader from 'dataloader';
import { RESULT_CODE } from 'src/common/common.constants';
import { normalize } from 'src/libs/utils';
import Dish from 'src/restaurants/entities/dish.entity';
import Restaurant from 'src/restaurants/entities/restaurant.entity';
import User, { UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import OrderItem from './entities/order-item.entity';
import Order, { OrderStatus } from './entities/order.entity';

@Injectable()
export class OrderService {
  private dataOrderLoader: DataLoader<number, Order, number>;

  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {
    this.dataOrderLoader = new DataLoader<number, Order>(
      async (ids: number[]) => {
        const orders = await this.orders.findByIds(ids, {
          relations: ['restaurant'],
        });
        const normalized = normalize(orders, order => order.id);
        return ids.map(id => normalized[id]);
      },
    );
  }

  // dataloader를 위한 data fetch
  orderLoader(id: number) {
    return this.dataOrderLoader.load(id);
  }

  // 주문 보기
  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.orderLoader(orderId);

      if (!order) {
        return {
          ok: false,
          code: RESULT_CODE.NOT_FOUND_ORDER,
          error: '주문을 찾을 수 없습니다.',
        };
      }

      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          code: RESULT_CODE.ORDER_INFO_NOT_SEE_ERROR,
          error: '주문 상태를 확인 할 수 없습니다',
        };
      }

      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
        order,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  // 주문 생성
  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          code: RESULT_CODE.NOT_FOUND_RESTAURANT,
          error: '레스토랑을 찾을 수 없습니다.',
        };
      }

      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        // 메뉴 찾기
        const dish = await this.dishes.findOne(item.dishId);
        if (!dish) {
          return {
            ok: false,
            code: RESULT_CODE.NOT_FOUND_DISH,
            error: '메뉴를 찾을 수 없습니다.',
          };
        }

        // 현재 메뉴의 가격
        let dishFinalPrice = dish.price;
        // 옵션에 따라 추가 가격을 붙인다
        for (const itemOption of item.options) {
          // 내가 선택한 옵션하고 db에 저정된 옵션 정보와 매칭되는 값을 찾는다
          const dishOption = dish.options.find(
            dishOption => dishOption.name === itemOption.name,
          );

          if (!dishOption) {
            return;
          }

          if (dishOption.extra) {
            dishFinalPrice = dishFinalPrice + dishOption.extra;
          } else {
            const dishOptionChoice = dishOption.choices?.find(
              optionChoice => optionChoice.name === itemOption.choice,
            );
            if (!dishOptionChoice) {
              return;
            }

            if (dishOptionChoice.extra) {
              dishFinalPrice = dishFinalPrice + dishOptionChoice.extra;
            }
          }
        }

        //  선택한 옵션 값들의 총합과 기본 가격을 합친값을 저장
        orderFinalPrice = orderFinalPrice + dishFinalPrice;
        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );
        orderItems.push(orderItem);
      }

      // 주문 생성
      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );

      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
        orderId: order.id,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  // 주문 정보 수정
  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOne(orderId);
      if (!order) {
        return {
          ok: false,
          code: RESULT_CODE.NOT_FOUND_ORDER,
          error: '주문을 찾을 수 없습니다',
        };
      }

      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          code: RESULT_CODE.ORDER_INFO_NOT_SEE_ERROR,
          error: '주문 상태를 확인 할 수 없습니다',
        };
      }

      if (!this.canEditOrder(status, user)) {
        return {
          ok: false,
          code: RESULT_CODE.ORDER_INFO_NOT_EDIT_ERROR,
          error: '주문 상태를 수정 할 수 없습니다',
        };
      }

      await this.orders.save({
        id: orderId,
        status,
      });

      const newOrder = { ...order, status };
      if (user.role === UserRole.Owner) {
        if (status === OrderStatus.Cooked) {
          // TODO
        }
      }

      return {
        ok: true,
        code: RESULT_CODE.SUCCESS,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  // 유저 타입에 따라 수정이 가능한지 불가능한지 체크
  private canSeeOrder(user: User, order: Order): boolean {
    let canSee = true;
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
      canSee = false;
    }
    return canSee;
  }

  private canEditOrder(status: OrderStatus, user: User): boolean {
    let canEdit = true;
    if (user.role === UserRole.Client) {
      canEdit = false;
    }

    if (user.role === UserRole.Owner) {
      if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
        canEdit = false;
      }
    }

    if (status !== OrderStatus.PickedUp && status !== OrderStatus.Delivered) {
      canEdit = false;
    }

    return canEdit;
  }
}
