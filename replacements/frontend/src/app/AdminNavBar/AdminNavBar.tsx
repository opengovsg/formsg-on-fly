import React, { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { BiCommentDetail } from 'react-icons/bi'
import { GoDotFill } from 'react-icons/go'
import { Link as ReactLink } from 'react-router-dom'
import {
  As,
  Box,
  chakra,
  Flex,
  FlexProps,
  HStack,
  Icon,
  useDisclosure,
} from '@chakra-ui/react'

import { SeenFlags } from '~shared/types'

import { BxsHelpCircle } from '~assets/icons/BxsHelpCircle'
import { BxsRocket } from '~assets/icons/BxsRocket'
import BrandMarkSvg from '~assets/svgs/brand/brand-mark-colour.svg?react'
import { FEATURE_REQUEST, FORM_GUIDE } from '~constants/links'
import {
  EMERGENCY_CONTACT_KEY_PREFIX,
  ROLLOUT_ANNOUNCEMENT_KEY_PREFIX,
} from '~constants/localStorage'
import { DASHBOARD_ROUTE } from '~constants/routes'
import { ADMIN_FEEDBACK_SESSION_KEY } from '~constants/sessionStorage'
import { useIsMobile } from '~hooks/useIsMobile'
import { useLocalStorage } from '~hooks/useLocalStorage'
import { useToast } from '~hooks/useToast'
import { logout } from '~services/AuthService'
import Button from '~components/Button'
import IconButton from '~components/IconButton'
import Link from '~components/Link'
import { AvatarMenu, AvatarMenuDivider } from '~templates/AvatarMenu/AvatarMenu'

import { SeenFlagsMapVersion } from '~features/user/constants'
import { useUserMutations } from '~features/user/mutations'
import { useUser } from '~features/user/queries'
import { TransferOwnershipModal } from '~features/user/transfer-ownership/TransferOwnershipModal'
import { getShowFeatureFlagLastSeen } from '~features/user/utils'
import { WhatsNewDrawer } from '~features/whats-new/WhatsNewDrawer'

import Menu from '../../components/Menu'

const BrandSmallLogo = chakra(BrandMarkSvg)

type AdminNavBarLinkProps = {
  label: string
  href: string
  MobileIcon: As
}

const AdminNavBarLink = ({ MobileIcon, href, label }: AdminNavBarLinkProps) => {
  const isMobile = useIsMobile()

  if (isMobile && MobileIcon) {
    return (
      <IconButton
        variant="clear"
        as="a"
        href={href}
        aria-label={label}
        icon={<Icon as={MobileIcon} fontSize="1.25rem" color="primary.500" />}
      />
    )
  }

  return (
    <Link
      w="fit-content"
      variant="standalone"
      color="secondary.500"
      href={href}
      aria-label={label}
      target="_blank"
    >
      {label}
    </Link>
  )
}

interface WhatsNewNavBarTabProps {
  onClick: () => void
  shouldShowNotiifcation: boolean
}

const WhatsNewNavBarTab = ({
  onClick,
  shouldShowNotiifcation,
}: WhatsNewNavBarTabProps) => {
  const isMobile = useIsMobile()

  const { t } = useTranslation()

  const WHATS_NEW_LABEL = t('features.app.adminNavBar.whatsNew')

  if (isMobile) {
    return (
      <Box position="relative">
        <IconButton
          variant="clear"
          aria-label={WHATS_NEW_LABEL}
          icon={<BxsRocket fontSize="1.25rem" color="primary.500" />}
          onClick={onClick}
        />
        {shouldShowNotiifcation && (
          <Icon
            as={GoDotFill}
            color="danger.500"
            position="absolute"
            ml="-15px"
          />
        )}
      </Box>
    )
  }

  return (
    <Box position="relative">
      <Button
        w="fit-content"
        variant="link"
        color="secondary.500"
        onClick={onClick}
        aria-label={WHATS_NEW_LABEL}
        fontWeight="500"
      >
        {WHATS_NEW_LABEL}
      </Button>
      {shouldShowNotiifcation && (
        <Icon as={GoDotFill} color="danger.500" position="absolute" ml="-5px" />
      )}
    </Box>
  )
}

export interface AdminNavBarProps {
  /* This prop is only for testing to show expanded menu state */
  isMenuOpen?: boolean
}

export const AdminNavBar = ({ isMenuOpen }: AdminNavBarProps): JSX.Element => {
  const { user, isLoading: isUserLoading, removeQuery } = useUser()
  const { updateLastSeenFlagMutation } = useUserMutations()
  const toast = useToast({ status: 'success', isClosable: true })

  const whatsNewFeatureDrawerDisclosure = useDisclosure()

  const ROLLOUT_ANNOUNCEMENT_KEY = useMemo(
    () => ROLLOUT_ANNOUNCEMENT_KEY_PREFIX + user?._id,
    [user],
  )
  const [hasSeenAnnouncement] = useLocalStorage<boolean>(
    ROLLOUT_ANNOUNCEMENT_KEY,
    false,
  )

  // Only want to show the emergency contact modal if user id exists but user has no emergency contact
  const emergencyContactKey = useMemo(
    () =>
      user && user._id && !user.contact
        ? EMERGENCY_CONTACT_KEY_PREFIX + user._id
        : null,
    [user],
  )

  const {
    isOpen: isTransferOwnershipModalOpen,
    onClose: onTransferOwnershipModalClose,
    onOpen: onTransferOwnershipModalOpen,
  } = useDisclosure()

  const shouldShowFeatureUpdateNotification = useMemo(() => {
    if (isUserLoading || !user) return false
    return getShowFeatureFlagLastSeen(
      user,
      SeenFlags.LastSeenFeatureUpdateVersion,
    )
  }, [isUserLoading, user])

  const onWhatsNewDrawerOpen = useCallback(() => {
    if (isUserLoading || !user) return
    if (shouldShowFeatureUpdateNotification) {
      updateLastSeenFlagMutation.mutateAsync({
        version: SeenFlagsMapVersion.lastSeenFeatureUpdateVersion,
        flag: SeenFlags.LastSeenFeatureUpdateVersion,
      })
    }
    whatsNewFeatureDrawerDisclosure.onOpen()
  }, [
    isUserLoading,
    updateLastSeenFlagMutation,
    user,
    whatsNewFeatureDrawerDisclosure,
    shouldShowFeatureUpdateNotification,
  ])

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_FEEDBACK_SESSION_KEY)
    logout()
    removeQuery()
    if (emergencyContactKey) {
      localStorage.removeItem(emergencyContactKey)
    }
    if (user?.grantSource === 'sso') {
      toast({
        title: 'You have been logged out of FormSG.',
        description: 'To log out from SSO, visit https://sso.open.gov.sg',
        status: 'success',
      })
    }
  }, [emergencyContactKey, removeQuery, toast, user])

  const { t } = useTranslation()

  const navLinks: AdminNavBarLinkProps[] = [
    {
      label: t('features.app.adminNavBar.linkLabel.featureRequest'),
      href: FEATURE_REQUEST,
      MobileIcon: BiCommentDetail,
    },
    {
      label: t('features.app.adminNavBar.linkLabel.formGuide'),
      href: FORM_GUIDE,
      MobileIcon: BxsHelpCircle,
    },
  ]

  return (
    <>
      <AdminNavBar.Container>
        <ReactLink
          title={t('features.app.adminNavBar.logoTitle')}
          to={DASHBOARD_ROUTE}
        >
          {<BrandSmallLogo w="2rem" />}
        </ReactLink>
        <HStack
          textStyle="subhead-1"
          spacing={{ base: '0.75rem', md: '1.5rem' }}
        >
          {navLinks.map((link, index) => (
            <AdminNavBarLink key={index} {...link} />
          ))}
          <WhatsNewNavBarTab
            onClick={onWhatsNewDrawerOpen}
            shouldShowNotiifcation={shouldShowFeatureUpdateNotification}
          />
          <AvatarMenu
            name={user?.email}
            menuUsername={user?.email}
            defaultIsOpen={isMenuOpen}
            menuListProps={{ maxWidth: '19rem' }}
          >
            <Menu.Item as={ReactLink} to="/billing">
              {t('features.app.adminNavBar.avatarMenuItem.billing')}
            </Menu.Item>
            <Menu.Item onClick={onTransferOwnershipModalOpen}>
              {t('features.app.adminNavBar.avatarMenuItem.transferAllForms')}
            </Menu.Item>
            <AvatarMenuDivider />
            <Menu.Item onClick={handleLogout}>
              {t('features.app.adminNavBar.avatarMenuItem.logout')}
            </Menu.Item>
          </AvatarMenu>
        </HStack>
      </AdminNavBar.Container>
      <WhatsNewDrawer
        isOpen={whatsNewFeatureDrawerDisclosure.isOpen}
        onClose={whatsNewFeatureDrawerDisclosure.onClose}
      />
      <TransferOwnershipModal
        onClose={onTransferOwnershipModalClose}
        isOpen={isTransferOwnershipModalOpen}
      />
    </>
  )
}

interface AdminNavBarContainerProps extends FlexProps {
  children: React.ReactNode
}

AdminNavBar.Container = ({
  children,
  ...props
}: AdminNavBarContainerProps): JSX.Element => {
  return (
    <Flex
      justify="space-between"
      align="center"
      px={{ base: '1.5rem', md: '1.8rem', xl: '2rem' }}
      py="0.75rem"
      bg="white"
      borderBottom="1px"
      borderBottomColor="neutral.300"
      {...props}
    >
      {children}
    </Flex>
  )
}
