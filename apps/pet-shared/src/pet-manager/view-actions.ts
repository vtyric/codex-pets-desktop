export type AppPetManagerCommand =
    | {
          kind: 'select-pet';
          petId: string;
      }
    | {
          kind: 'delete-pet';
          petId: string;
      }
    | {
          kind: 'hide-running-pet';
      }
    | {
          kind: 'show-running-pet';
      };

export interface AppPetManagerAction {
    id: string;
    label: string;
    command: AppPetManagerCommand;
}
