import { WellLog } from '@/components/well-log/WellLog';
import { Button } from '@int/geotoolkit/controls/toolbar/Button';
import { Toolbar } from '@int/geotoolkit/controls/toolbar/Toolbar';
import { AnchorType } from '@int/geotoolkit/util/AnchorType';
import { from } from '@int/geotoolkit/selection/from';
import { Node } from '@int/geotoolkit/scene/Node';
import { Orientation } from '@int/geotoolkit/util/Orientation';
import { IndexMeasurement } from '@/common/model/IndexMeasurement';
import { RubberBandTool } from '@/components/well-log/tools/RubberBandTool';
import { TrackType } from '@int/geotoolkit/welllog/TrackType';
import { LogTrack } from '@int/geotoolkit/welllog/LogTrack';
import { RubberBandRenderMode } from '@int/geotoolkit/controls/tools/RubberBandRenderMode';
import { LogCurve } from '@int/geotoolkit/welllog/LogCurve';
import { MathUtil } from '@int/geotoolkit/util/MathUtil';

type HeaderScrollPosition = 'top' | 'bottom';

export class WellLogWithTools extends WellLog {

	constructor(
		private initialHeaderHeight: number = 90,
		private initialHeaderScrollPosition: HeaderScrollPosition = 'bottom',
		...props: ConstructorParameters<typeof WellLog>
	) {
		super(...props);
		this.createDepthsSelectionTool();
		this.createLimitsSelectionToolIfPossible();
		this.createToolbar();
	}

	private createLimitsSelectionToolIfPossible() {
		const nonIndexTracks = this.root
			.getTrackContainer()
			.getChildren((t: Node) => t instanceof LogTrack && t.getTag().type !== TrackType.IndexTrack)
			.toArray();

				if (nonIndexTracks.length === 1) {
					const track = nonIndexTracks[0];
					const limitsSelection = new RubberBandTool(
						'limitsSelection',
						this.root.getTrackManipulatorLayer(),
						RubberBandRenderMode.Horizontal
					);
					limitsSelection.onSelected((range) => {
						const trackWidth = track.getBounds().getWidth();
						(from(track)
							.where((node: Node) => node instanceof LogCurve)
							.selectToArray() as LogCurve[])
							.forEach((c: LogCurve) => {
								const minimum = c.getMinimumNormalizationLimit();
								const maximum = c.getMaximumNormalizationLimit();
								const multiplier = Math.abs(maximum - minimum) / trackWidth;
								c.setNormalizationLimits(
									minimum + MathUtil.sign(maximum - minimum) * range.getLow() * multiplier,
									minimum + MathUtil.sign(maximum - minimum) * range.getHigh() * multiplier
								);
							})
					});
					this.root.connectTool(limitsSelection);
				}
	}

	private createDepthsSelectionTool() {
		const depthsSelection = new RubberBandTool(
			'depthsSelection',
			this.root.getTrackManipulatorLayer(),
			RubberBandRenderMode.Vertical
		);
		depthsSelection.onSelected((range) => {
			this.root.setVisibleDepthLimits(range);
			this.root.getToolByName('trackPanning')?.setEnabled(true);
			this.root.getToolByName('limitsSelection')?.setEnabled(false);
			this.root.getToolByName('depthsSelection')?.setEnabled(false);
		});
		this.root.connectTool(depthsSelection);
	}

	private createToolbar() {
		new Toolbar({
			tools: this.plot.getTool(),
			alignment: AnchorType.RightBottom,
			orientation: Orientation.Horizontal,
			buttons: [
				...this.createToolsButtons(),
				...this.createIndexMeasurementsButtons()
			]
		})
	}

	private createToolsButtons(): Button[] {
		return [
			new Button({
				icon: 'fa fa-magnifying-glass-plus',
				title: 'Zoom in',
				action: () => this.root.scale(5 / 4)
			}),
			new Button({
				icon: 'fa fa-magnifying-glass-minus',
				title: 'Zoom out',
				action: () => this.root.scale(4 / 5)
			}),
			new Button({
				icon: 'fa fa-expand',
				title: 'Fit to bounds',
				action: () => this.root.fitToHeight()
			}),
			new Button({
				icon: 'fa-solid fa-window-maximize',
				title: 'Show/hide header',
				checkbox: {
					enabled: true,
					checked: true
				},
				action: (_: never, checked: boolean) => this.toggleHeader(checked)
			}),
			new Button({
				icon: 'fa-solid fa-arrows-left-right-to-line fa-rotate-90',
				title: 'Select limits',
				action: () => {
					this.root.getToolByName('trackPanning')?.setEnabled(false);
					this.root.getToolByName('limitsSelection')?.setEnabled(true);
				}
			}),
			new Button({
				icon: 'fa-solid fa-arrows-left-right-to-line',
				title: 'Select depths',
				action: () => {
					this.root.getToolByName('trackPanning')?.setEnabled(false);
					this.root.getToolByName('depthsSelection')?.setEnabled(true);
				}
			})
		];
	}

	private toggleHeader(visible: boolean) {
		const tracks = from(this.root).where((node: Node) => node.getName() === 'TrackControlGroup').selectFirst();
		const header = from(this.root).where((node: Node) => node.getName() === 'HeaderControlGroup').selectFirst().getParent();
		const headerHeight = visible ? this.initialHeaderHeight : 0;

		tracks.setLayoutStyle({ left: 0, right: 0, bottom: 0, top: headerHeight });
		header.setLayoutStyle({ left: 0, top: 0, right: 0, height: headerHeight });

		this.root.updateLayout();
		this.root.fitToHeight();

		switch (this.initialHeaderScrollPosition) {
			case 'top': this.root.getHeaderContainer().scrollToTop(); break;
			case 'bottom': this.root.getHeaderContainer().scrollToBottom(); break;
		}
	}

	private createIndexMeasurementsButtons(): Button[] {
		return this.source.getIndexMeasurements().map((measurement: IndexMeasurement, index: number) => {
			const buttonElement = document.createElement('div')
			buttonElement.innerText = measurement.getName();
			buttonElement.className = 'cg-toolbar-button cg-toolbar-text-button'

			return new Button({
				element: buttonElement,
				title: measurement,
				checkbox: {
					enabled: true,
					name: 'index-measurement',
					checked: index === 0
				},
				action: () => this.setIndexMeasurement(measurement)
			});
		})
	}

}