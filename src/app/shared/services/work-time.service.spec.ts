import { inject, TestBed } from '@angular/core/testing';

import { WorkDataService } from './work-data.service';


fdescribe('WorkTimeService', () => {
  const date = new Date();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [WorkDataService]
    });
  });

  it('should create', inject([WorkDataService], (service: WorkDataService) => {
    expect(service).toBeTruthy();
  }));

  /**
   * isObjectEmpty
   */
  it('should return object is empty', inject([WorkDataService], (service: WorkDataService) => {
    expect(service.isObjectEmpty({})).toBe(true);
  }));

  it('should return object is not empty', inject([WorkDataService], (service: WorkDataService) => {
    expect(service.isObjectEmpty({time: 123000})).toBe(false);
  }));

  /**
   * getLastKey
   */
  it('should return last timestamp', inject([WorkDataService], (service: WorkDataService) => {
    expect(service.getLastKey({
      1610612100000: {time: 228000, actions: 0},
      1610612400000: {time: 300000, actions: 0},
      1610612700000: {time: 299000, actions: 0},
      1610613000000: {time: 299000, actions: 0},
      1610613300000: {time: 268000, actions: 0}
    })).toBe(1610613300000);
  }));

  it('should return without result', inject([WorkDataService], (service: WorkDataService) => {
    expect(service.getLastKey({})).toBe(undefined);
  }));

  /**
   * getStartWeek, getStartDay, getStartHour
   * should return timestamp
   */
  it('should return this Monday 00:00:00', inject([WorkDataService], (service: WorkDataService) => {
    const startWeekDate = (date.getDate() - date.getDay()) + 1;
    const result = new Date(date.getFullYear(), date.getMonth(), startWeekDate).getTime();
    expect(service.getStartWeek(date)).toBe(result);
  }));

  it('should return today 00:00:00', inject([WorkDataService], (service: WorkDataService) => {
    const result = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    expect(service.getStartDay(date)).toBe(result);
  }));

  it('should return start of present hour', inject([WorkDataService], (service: WorkDataService) => {
    const result = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).getTime();
    expect(service.getStartHour(date)).toBe(result);
  }));

  /**
   * getSummaryTimeFromObject
   */
  it('should return sum of all time value', inject([WorkDataService], (service: WorkDataService) => {
    expect(service.getSummaryTimeFromObject({
      1610316000000: {
        1610488800000: {
          1610553600000: {
            1610556000000: {time: 23000, actions: 0},
            1610556300000: {time: 300000, actions: 0},
            1610556600000: {time: 300000, actions: 0},
            1610556900000: {time: 196000, actions: 0}
          }
        },
        1610575200000: {
          1610611200000: {
            1610612100000: {time: 228000, actions: 0},
            1610612400000: {time: 300000, actions: 0},
            1610612700000: {time: 299000, actions: 0},
            1610613000000: {time: 299000, actions: 0},
            1610613300000: {time: 268000, actions: 0}
          }
        }
      }
    })).toBe(2213000);
  }));

  /**
   * createWorkTimeObject
   * change needed service property to public for testing and change to private after testing
   */
  // it('should create new workTimeObject ', inject([WorkTimeService], (service: WorkTimeService) => {
  //   service.startWeek = service.getStartWeek(date);
  //   service.startDay = service.getStartDay(date);
  //   service.startHour = service.getStartHour(date);
  //   service.createWorkTimeObject();
  //
  //   expect(service.workTime).toEqual({
  //     [service.getStartWeek(date)]: {
  //       [service.getStartDay(date)]: {
  //         [service.getStartHour(date)]: {
  //           [service.getLastIntervalTime()]: {
  //             time: 0,
  //             actions: 0
  //           }
  //         }
  //       }
  //     }
  //   });
  // }));

  /**
   * createIntervalObject
   * needed update timestamp in interval object name
   * change needed service property to public for testing and change to private after testing
   */
  // it('should add to workTime object new workInterval', inject([WorkTimeService], (service: WorkTimeService) => {
  //   service.setInterval(300);
  //   service.setStartTimeValues();
  //   service.createWorkTimeObject();
  //   service.lastWeekKey = service.getLastKey(service.workTime);
  //   service.lastDayKey = service.getLastKey(service.workTime[service.lastWeekKey]);
  //   service.lastHourKey = service.getLastKey(service.workTime[service.lastWeekKey][service.lastDayKey]);
  //   service.createIntervalObject();
  //
  //   expect(service.workTime).toEqual({
  //     [service.getStartWeek(date)]: {
  //       [service.getStartDay(date)]: {
  //         [service.getStartHour(date)]: {
  //           1610633700000: {
  //               time: 0,
  //               actions: 0
  //             }
  //         }
  //       }
  //     }
  //   });
  // }));

  /**
   * addNewWeek
   * change needed service property to public for testing and change to private after testing
   */
  // it('should add to workTime object new week', inject([WorkTimeService], (service: WorkTimeService) => {
  //   service.setInterval(300);
  //   service.setStartTimeValues();
  //   service.createWorkTimeObject();
  //   service.addNewWeek();
  //
  //   expect(service.workTime).toEqual({
  //     [service.getStartWeek(date)]: {
  //       [service.getStartDay(date)]: {
  //         [service.getStartHour(date)]: {}
  //       }
  //     }
  //   });
  // }));

  /**
   * addNewDay
   * change needed service property to public for testing and change to private after testing
   */
  // it('should add to workTime object new day', inject([WorkTimeService], (service: WorkTimeService) => {
  //   service.setInterval(300);
  //   service.setStartTimeValues();
  //   service.createWorkTimeObject();
  //   service.lastWeekKey = service.getStartWeek(date);
  //   service.addNewWeek();
  //
  //   expect(service.workTime).toEqual({
  //     [service.getStartWeek(date)]: {
  //       [service.getStartDay(date)]: {
  //         [service.getStartHour(date)]: {}
  //       }
  //     }
  //   });
  // }));

  /**
   * addNewHour
   * change needed service property to public for testing and change to private after testing
   */
  // it('should add to workTime object new hour', inject([WorkTimeService], (service: WorkTimeService) => {
  //   service.setInterval(300);
  //   service.setStartTimeValues();
  //   service.createWorkTimeObject();
  //   service.lastWeekKey = service.getStartWeek(date);
  //   service.lastDayKey = service.getStartDay(date);
  //   service.addNewHour();
  //
  //   expect(service.workTime).toEqual({
  //     [service.getStartWeek(date)]: {
  //       [service.getStartDay(date)]: {
  //         [service.getStartHour(date)]: {
  //           [service.getLastIntervalTime()]: {
  //             time: 0,
  //             actions: 0
  //           }
  //         }
  //       }
  //     }
  //   });
  // }));
});
