import {Deferred} from '@/common/model/Deferred';

export class DataSource<T> {

    protected loading = new Deferred<T>();

    public get loaded (): Promise<T> {
        return this.loading.promise;
    }

}
