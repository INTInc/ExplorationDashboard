import { Ref } from 'vue';
import { ref } from '@vue/runtime-core';
import { Well } from '@/data-sources/Well';

export class WellModelCursor {

	private well: Well = new Well();
	private depthRef: Ref<number> = ref(0);

	public set depth(depth: number) {
		this.depthRef.value = depth || 0;
	}

	public get depth() {
		return this.depthRef.value;
	}

	public attachToWell(well: Well): WellModelCursor {
		this.well = well;
		return this;
	}

}