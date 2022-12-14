import { Avatar, AvatarBadge, Box, Button, Flex, Heading, Popover, PopoverContent, PopoverTrigger, Spinner } from '@chakra-ui/react';
import Link from 'next/link';
import Router from 'next/router';
import { gql, Reference } from '@apollo/client';

import { routes } from 'config';
import { MeDocument, MeQuery, useLogoutMutation, useMeQuery } from 'generated/graphql';

type Props = {};

function NavBar({}: Props) {
  const { data: meData, loading: meLoading, error: _meError } = useMeQuery();
  const [logout, { data: _logoutData, loading: _logoutLoading, error: _logoutError }] = useLogoutMutation();

  const handleOnLogout = () => {
    logout({
      update(cache, { data }) {
        if (data?.logout) cache.writeQuery<MeQuery>({ query: MeDocument, data: { me: null } });
        cache.modify({
          fields: {
            getPosts(existing) {
              existing.paginatedPosts.forEach((post: Reference) => {
                cache.writeFragment({
                  id: post.__ref,
                  fragment: gql`
                    fragment voteType on Post {
                      voteType
                    }
                  `,
                  data: {
                    voteType: 0,
                  },
                });
              });

              return existing;
            },
          },
        });
      },
    });
  };

  if (meLoading)
    return (
      <Flex w="100vw" h="100vh" justifyContent="center" alignItems="center">
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />;
      </Flex>
    );

  return (
    <Box bg="tan" p={4}>
      <Flex maxW={800} justifyContent="space-between" m="auto" alignItems="center">
        <Heading>Blogger</Heading>
        <Box>
          <Flex alignItems="center">
            {(meData?.me && (
              <Popover>
                <PopoverTrigger>
                  <Avatar>
                    <AvatarBadge boxSize="1.25em" bg="green.500" />
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent p={2}>
                  <Button>Th??ng tin t??i kho???n</Button>
                  <Button mt={2} onClick={() => Router.push(routes.createPost)}>
                    T???o b??i vi???t
                  </Button>
                  <Button mt={2} onClick={handleOnLogout}>
                    ????ng xu???t
                  </Button>
                </PopoverContent>
              </Popover>
            )) || (
              <>
                <Link href={routes.login} style={{ marginRight: 4 }}>
                  ????ng nh???p
                </Link>
                <Link href={routes.register}>????ng k??</Link>
              </>
            )}
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}

export default NavBar;
