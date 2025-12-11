import { Modal } from "../core/Modal";
import { RepositoryImporter } from "./RepositoryImporter";

type ImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
};

export const ImportModal = ({
  isOpen,
  onClose,
  onImportSuccess,
}: ImportModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Repository">
      <RepositoryImporter
        onImportSuccess={() => {
          onImportSuccess?.();
          onClose();
        }}
      />
    </Modal>
  );
};
