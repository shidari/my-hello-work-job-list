"use client";

import { useRouter } from "next/navigation";
import { type ComponentRef, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export function Modal({ children }: { children: React.ReactNode }) {
	const modalRoot = document.getElementById("modal-root");
	if (!modalRoot) throw new Error("modal-root要素が存在しません");
	const router = useRouter();
	const dialogRef = useRef<ComponentRef<"dialog">>(null);

	useEffect(() => {
		if (!dialogRef.current?.open) {
			dialogRef.current?.showModal();
		}
	}, []);

	function onDismiss() {
		router.back();
	}

	return createPortal(
		<div className="modal-backdrop">
			<dialog ref={dialogRef} className="modal" onClose={onDismiss}>
				{children}
				<button onClick={onDismiss} className="close-button" type="button" />
			</dialog>
		</div>,
		modalRoot,
	);
}
