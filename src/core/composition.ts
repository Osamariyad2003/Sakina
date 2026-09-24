import { config } from '../config';
import { httpMoodRepository } from '../features/mood/services/httpMoodRepository';
import { localMoodRepository } from '../features/mood/services/localMoodRepository';
import { setMoodRepository } from '../features/mood/services/moodService';
import {
  httpAppointmentRepository,
  httpProfessionalDirectory,
} from '../features/professional-help/services/httpProfessionalRepository';
import {
  localAppointmentRepository,
  localProfessionalDirectory,
} from '../features/professional-help/services/localProfessionalRepository';
import { setProfessionalRepositories } from '../features/professional-help/services/professionalService';

/**
 * Composition root: the one place that decides which repository
 * implementation each feature runs against.
 *
 * Use-case modules (`*Service.ts`) deliberately do **not** import their
 * implementations. That is what keeps them testable under plain Node — the
 * moment a use case imports the HTTP or MMKV implementation, it drags axios
 * and React Native into every test that touches it
 * (docs/architecture-review.md §2.3).
 *
 * Called once from `App.tsx`, before anything renders. Features that have not
 * been migrated to repositories yet still pick their implementation inside
 * their own service; they will move here as they are converted.
 */
export function composeRepositories(): void {
  const live = !config.useMockServices;

  setMoodRepository(live ? httpMoodRepository : localMoodRepository);

  setProfessionalRepositories(
    live
      ? { directory: httpProfessionalDirectory, appointments: httpAppointmentRepository }
      : { directory: localProfessionalDirectory, appointments: localAppointmentRepository },
  );
}
