import { useLocalNow } from "../../shared/time";
import { RoomIllustration } from "./RoomIllustration";

/** The illustration stays independent of the future Blender / GLB renderer. */
export function PetRoomPlaceholder() {
  const now = useLocalNow();
  return (
    <aside
      className="pet-room"
      aria-label="Комната питомца — иллюстрация-заглушка"
    >
      <RoomIllustration layout="desktop" />
      <RoomIllustration layout="mobile" />
      <div className="room-date" aria-label={now.toLocaleString("ru-RU")}>
        <span>
          {now
            .toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
            .toUpperCase()}
        </span>
        <span>
          {now.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </aside>
  );
}
