// noinspection ES6UnusedImports
import {h} from 'dom-chef';
import select from 'select-dom';
import * as icons from '../libs/icons';

export default async () => {
	// Javadocs
	const javadocRegions = [];
	const handleJavadocTrigger = (e) => {
		const triggerNode = e.target;
		const triggerIndex = Number(triggerNode.getAttribute("javadoc-trigger-index"));
		const javadocRegion = javadocRegions[triggerIndex];

		// hide rows after startNode up to the endNode (inclusive)
		if (javadocRegion.startNode.getAttribute("id") !== javadocRegion.endNode.getAttribute("id")) {
			const endNodeParent = javadocRegion.endNode.parentNode;
			let last = javadocRegion.startNode.parentNode;
			const nodeRegion = [last];
			while (true) {
				last = last.nextElementSibling;
				nodeRegion.push(last);
				if (last === endNodeParent) {
					break;
				}
			}
			const javadocContent = (
				<div className={"text-gray"}>
				</div>
			);
			let currentParagraph = (
				<p/>
			);
			for (const regionLine of nodeRegion) {
				if (regionLine !== javadocRegion.startNode.parentNode) {
					regionLine.style.display = "none";
				}
				const lineText = regionLine.children[1].textContent.trim();
				if (!lineText.startsWith("*")) {
					continue;
				}
				if (lineText.replace("*", "") === "") {
					// empty line
					javadocContent.append(currentParagraph);
					currentParagraph = (
						<p/>
					)
				} else {
					currentParagraph.append(lineText.replace("*/", "").replace("*", "").trim());
				}
			}
			javadocContent.append(currentParagraph);

			// create box
			javadocRegion.startNode.style.display = "none";
			javadocRegion.startNode.parentNode.append(
				<td>
					<div className={"Box code-awareness javadoc-box"}>
						<div>
							{javadocContent}
						</div>
					</div>
				</td>
			)
		}
	};

	const javaComments = select.all(".type-java td.js-file-line > .pl-c .pl-c");
	let currentLine = null;
	for (const javaCommentSegment of javaComments) {
		if (javaCommentSegment.innerHTML.startsWith("/**")) {
			// Javadoc header
			if (currentLine) {
				// Inside javadoc already
				continue;
			}
			const lineNode = javaCommentSegment.parentNode.parentNode;
			currentLine = {
				startNode: lineNode
			};
		}
		if (javaCommentSegment.innerHTML.endsWith("*/")) {
			if (!currentLine) {
				// Not inside Javadoc
				continue;
			}
			currentLine.endNode = javaCommentSegment.parentNode.parentNode;
			currentLine.startNode.prepend(
				<span
					className={"code-awareness javadoc-trigger tooltipped tooltipped-nw"}
					aria-label={"Javadoc"}
					javadoc-trigger-index={javadocRegions.length}
					onClick={handleJavadocTrigger}
				>
					{icons.quote()}
				</span>
			);
			javadocRegions.push(currentLine);
			currentLine = null;
		}
	}
	console.log(javadocRegions);
};
