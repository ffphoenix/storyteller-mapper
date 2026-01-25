import { runInAction } from "mobx";
import type { AxiosError } from "axios";
import type { DataStorage } from "../../createDataStorage";
import type { CRUDErrorBadRequestResponse } from "../../../../../generated/api";

export default <T>(
  DataStorage: DataStorage<T>,
  create: () => Promise<any>,
  update: () => Promise<any>,
  fetchList: () => void,
) => {
  const updateStorage = () => {
    runInAction(() => {
      DataStorage.resetCurrent();
      DataStorage.togglePopup();
      DataStorage.formUI.isLoading = false;
    });
    fetchList();
  };

  const catchError = (error: AxiosError) => {
    runInAction(() => {
      if (error.status === 400) {
        const response = error.response?.data as CRUDErrorBadRequestResponse;
        DataStorage.formUI.errors = response.errors;
      } else {
        // @todo global toast messages
        // DataStorage.formUI.networkError = error.message;
      }
      DataStorage.formUI.isLoading = false;
    });
  };

  runInAction(() => (DataStorage.formUI.isLoading = true));
  if (DataStorage.isCurrentNew) {
    create().then(updateStorage).catch(catchError);
  } else {
    update().then(updateStorage).catch(catchError);
  }
};
